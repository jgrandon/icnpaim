import axios from 'axios';
import config from '../config/config';

const WP_API_BASE = process.env.WP_API_BASE || 'https://icnpaim.cl/wp-json/wp/v2';
const WP_AUTH = {
  username: process.env.WORDPRESS_API_USER,
  password: process.env.WORDPRESS_API_PASSWORD
};

class WordPressClient {
  constructor() {
    this.client = axios.create({
      baseURL: 'https://icnpaim.cl/wp-json/wp/v2',
      auth: {
        username: 'admin',
        password: 'admin'
      },
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    // Interceptor para logging
    this.client.interceptors.request.use(
      (config) => {
        console.log('WP API Request:', {
          url: config.url,
          method: config.method,
          data: config.data,
          params: config.params
        });
        return config;
      },
      (error) => {
        console.error('WP API Request Error:', error);
        return Promise.reject(error);
      }
    );
    
    this.client.interceptors.response.use(
      (response) => {
        console.log('WP API Response:', {
          status: response.status,
          url: response.config.url,
          data: response.data
        });
        return response;
      },
      (error) => {
        console.error('WP API Response Error:', {
          status: error.response?.status,
          url: error.config?.url,
          message: error.message,
          data: error.response?.data
        });
        return Promise.reject(error);
      }
    );
  }

  async findOrCreateStudent({ sub, email, name }) {
    try {
      // Primero intentar sincronizar via endpoint personalizado
      try {
        const syncResponse = await axios.post('https://icnpaim.cl/wp-json/lti/v1/sync/student', {
          sub,
          email,
          name
        }, {
          auth: this.client.defaults.auth,
          timeout: 5000
        });
        
        console.log('Student sync response:', syncResponse.data);
        
        // Obtener el estudiante actualizado
        const studentResponse = await this.client.get(`/student/${syncResponse.data.id}`);
        return studentResponse.data;
      } catch (syncError) {
        console.warn('Sync endpoint failed, falling back to direct API:', syncError.message);
      }
      
      // Buscar por meta lms_sub (sin underscore inicial)
      const searchResponse = await this.client.get('/student', {
        params: {
          meta_key: 'lms_sub',
          meta_value: sub,
          per_page: 1
        }
      });

      if (searchResponse.data.length > 0) {
        const student = searchResponse.data[0];
        // Actualizar datos si han cambiado
        await this.client.post(`/student/${student.id}`, {
          title: name,
          meta: {
            lms_sub: sub,
            email: email,
            full_name: name
          }
        });
        return student;
      }

      // Crear nuevo estudiante
      const createResponse = await this.client.post('/student', {
        title: name,
        status: 'publish',
        meta: {
          lms_sub: sub,
          email: email,
          full_name: name,
          course_ids: []
        }
      });

      return createResponse.data;
    } catch (error) {
      console.error('Error in findOrCreateStudent:', error.message);
      throw error;
    }
  }

  async findOrCreateCourse({ contextId, title, label }) {
    try {
      console.log('=== BUSCANDO/CREANDO CURSO ===');
      console.log('Datos:', { contextId, title, label });
      
      // Buscar por meta lms_context_id
      const searchResponse = await this.client.get('/course', {
        params: {
          meta_key: 'lms_context_id',
          meta_value: contextId,
          per_page: 1
        }
      });
      
      console.log('Course search response:', searchResponse.data);

      if (searchResponse.data.length > 0) {
        const course = searchResponse.data[0];
        console.log('Curso encontrado, actualizando:', course.id);
        // Actualizar datos si han cambiado
        await this.client.post(`/course/${course.id}`, {
          title: title,
          meta: {
            lms_context_id: contextId,
            lms_context_label: label,
            lms_context_title: title
          }
        });
        
        // Obtener datos actualizados
        const updatedResponse = await this.client.get(`/course/${course.id}`);
        console.log('Curso actualizado:', updatedResponse.data);
        return updatedResponse.data;
      }

      console.log('Curso no encontrado, creando nuevo...');
      // Crear nuevo curso
      const createResponse = await this.client.post('/course', {
        title: title,
        status: 'publish',
        meta: {
          lms_context_id: contextId,
          lms_context_label: label,
          lms_context_title: title,
          student_ids: JSON.stringify([])
        }
      });

      console.log('Nuevo curso creado:', createResponse.data);
      
      // Crear unidades de ejemplo para el nuevo curso
      await this.createSampleUnits(createResponse.data.id);
      
      return createResponse.data;
    } catch (error) {
      console.error('=== ERROR CREANDO CURSO ===');
      console.error('Error:', error.message);
      console.error('Response data:', error.response?.data);
      throw error;
    }
  }

  async linkStudentToCourse(studentId, courseId) {
    try {
      console.log('Linking student to course:', { studentId, courseId });
      
      // Obtener student actual
      const studentResponse = await this.client.get(`/student/${studentId}`);
      const student = studentResponse.data;
      
      // Obtener course actual
      const courseResponse = await this.client.get(`/course/${courseId}`);
      const course = courseResponse.data;

      // Actualizar relaciones bidireccionales
      const studentCourseIds = student.meta.course_ids ? 
        (typeof student.meta.course_ids === 'string' ? JSON.parse(student.meta.course_ids) : student.meta.course_ids) : [];
      const courseStudentIds = course.meta.student_ids ? 
        (typeof course.meta.student_ids === 'string' ? JSON.parse(course.meta.student_ids) : course.meta.student_ids) : [];

      if (!studentCourseIds.includes(courseId)) {
        studentCourseIds.push(courseId);
        await this.client.post(`/student/${studentId}`, {
          meta: { course_ids: JSON.stringify(studentCourseIds) }
        });
      }

      if (!courseStudentIds.includes(studentId)) {
        courseStudentIds.push(studentId);
        await this.client.post(`/course/${courseId}`, {
          meta: { student_ids: JSON.stringify(courseStudentIds) }
        });
      }

      console.log('Student-Course link completed');
      return { success: true };
    } catch (error) {
      console.error('Error in linkStudentToCourse:', error.message);
      throw error;
    }
  }

  async getUnits(courseId) {
    try {
      console.log('Getting units for course:', courseId);
      
      const response = await this.client.get('/unit', {
        params: {
          meta_key: 'course_id',
          meta_value: courseId,
          per_page: 100
        }
      });

      return response.data.map(unit => ({
        ...unit,
        cards: unit.meta.unit_cards ? 
          (typeof unit.meta.unit_cards === 'string' ? JSON.parse(unit.meta.unit_cards) : unit.meta.unit_cards) : [],
        settings: unit.meta.unit_settings ? 
          (typeof unit.meta.unit_settings === 'string' ? JSON.parse(unit.meta.unit_settings) : unit.meta.unit_settings) : {}
      }));
    } catch (error) {
      console.error('Error in getUnits:', error.message);
      return [];
    }
  }

  async upsertProgress({ studentId, courseId, unitId, completedCardId }) {
    try {
      // Buscar progreso existente
      const searchResponse = await this.client.get('/progress', {
        params: {
          meta_key: 'student_id',
          meta_value: studentId,
          per_page: 1
        }
      });

      let progress;
      let completedCardIds = [];
      
      // Filtrar por course_id y unit_id
      const existingProgress = searchResponse.data.find(p => 
        p.meta.course_id == courseId && p.meta.unit_id == unitId
      );
      
      if (existingProgress) {
        progress = existingProgress;
        completedCardIds = progress.meta.completed_card_ids ? 
          (typeof progress.meta.completed_card_ids === 'string' ? JSON.parse(progress.meta.completed_card_ids) : progress.meta.completed_card_ids) : [];
      }

      // Añadir nueva card completada (evitar duplicados)
      if (completedCardId && !completedCardIds.includes(completedCardId)) {
        completedCardIds.push(completedCardId);
      }

      // Obtener total de cards de la unidad
      const unit = await this.client.get(`/unit/${unitId}`);
      const unitCards = unit.data.meta.unit_cards ? 
        (typeof unit.data.meta.unit_cards === 'string' ? JSON.parse(unit.data.meta.unit_cards) : unit.data.meta.unit_cards) : [];
      const totalCards = unitCards.length;
      const percent = totalCards > 0 ? Math.round((completedCardIds.length / totalCards) * 100) : 0;

      const progressData = {
        title: `Progreso ${studentId}-${courseId}-${unitId}`,
        status: 'publish',
        meta: {
          student_id: studentId,
          course_id: courseId,
          unit_id: unitId,
          completed_card_ids: JSON.stringify(completedCardIds),
          percent: percent
        }
      };

      if (progress) {
        // Actualizar existente
        await this.client.post(`/progress/${progress.id}`, progressData);
        return { ...progress, meta: progressData.meta };
      } else {
        // Crear nuevo
        const createResponse = await this.client.post('/progress', progressData);
        return createResponse.data;
      }
    } catch (error) {
      console.error('Error in upsertProgress:', error.message);
      throw error;
    }
  }

  async getGrades(studentId, courseId) {
    try {
      const response = await this.client.get('/grade', {
        params: {
          meta_key: 'student_id',
          meta_value: studentId,
          per_page: 100
        }
      });

      // Filtrar por course_id
      return response.data.filter(grade => grade.meta.course_id == courseId);
    } catch (error) {
      console.error('Error in getGrades:', error.message);
      return [];
    }
  }

  async upsertGradesFromAGS({ studentId, courseId, agsResults }) {
    try {
      const results = [];
      
      for (const result of agsResults) {
        const gradeData = {
          title: `Nota ${result.lineItemId} - ${studentId}`,
          status: 'publish',
          meta: {
            student_id: studentId,
            course_id: courseId,
            lineitem_id: result.lineItemId,
            score_given: result.scoreGiven || 0,
            score_maximum: result.scoreMaximum || 100,
            activity_title: result.activityTitle || 'Actividad',
            attempt_id: result.attemptId || null,
            timestamp: result.timestamp || new Date().toISOString(),
            provenance: 'lms'
          }
        };

        // Buscar grade existente
        const searchResponse = await this.client.get('/grade', {
          params: {
            meta_key: 'lineitem_id',
            meta_value: result.lineItemId,
            per_page: 1
          }
        });

        const existingGrade = searchResponse.data.find(g => 
          g.meta.student_id == studentId
        );
        
        if (existingGrade) {
          // Actualizar existente
          await this.client.post(`/grade/${existingGrade.id}`, gradeData);
          results.push({ ...existingGrade, meta: gradeData.meta });
        } else {
          // Crear nuevo
          const createResponse = await this.client.post('/grade', gradeData);
          results.push(createResponse.data);
        }
      }

      return results;
    } catch (error) {
      console.error('Error in upsertGradesFromAGS:', error.message);
      throw error;
    }
  }

  async getProgress(studentId, courseId, unitId = null) {
    try {
      const response = await this.client.get('/progress', {
        params: {
          meta_key: 'student_id',
          meta_value: studentId,
          per_page: 100
        }
      });

      // Filtrar por course_id y opcionalmente unit_id
      return response.data.filter(progress => {
        const matchesCourse = progress.meta.course_id == courseId;
        const matchesUnit = unitId ? progress.meta.unit_id == unitId : true;
        return matchesCourse && matchesUnit;
      });
    } catch (error) {
      console.error('Error in getProgress:', error.message);
      return [];
    }
  }
}

export default new WordPressClient();