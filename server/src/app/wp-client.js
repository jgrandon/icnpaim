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
      baseURL: WP_API_BASE,
      auth: WP_AUTH,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  async findOrCreateStudent({ sub, email, name }) {
    try {
      // Buscar por meta _lms_sub
      const searchResponse = await this.client.get('/student', {
        params: {
          meta_key: '_lms_sub',
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
            _lms_sub: sub,
            _email: email,
            _full_name: name
          }
        });
        return student;
      }

      // Crear nuevo estudiante
      const createResponse = await this.client.post('/student', {
        title: name,
        status: 'publish',
        meta: {
          _lms_sub: sub,
          _email: email,
          _full_name: name,
          _course_ids: []
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
      // Buscar por meta _lms_context_id
      const searchResponse = await this.client.get('/course', {
        params: {
          meta_key: '_lms_context_id',
          meta_value: contextId,
          per_page: 1
        }
      });

      if (searchResponse.data.length > 0) {
        const course = searchResponse.data[0];
        // Actualizar datos si han cambiado
        await this.client.post(`/course/${course.id}`, {
          title: title,
          meta: {
            _lms_context_id: contextId,
            _lms_context_label: label,
            _lms_context_title: title
          }
        });
        return course;
      }

      // Crear nuevo curso
      const createResponse = await this.client.post('/course', {
        title: title,
        status: 'publish',
        meta: {
          _lms_context_id: contextId,
          _lms_context_label: label,
          _lms_context_title: title,
          _student_ids: []
        }
      });

      return createResponse.data;
    } catch (error) {
      console.error('Error in findOrCreateCourse:', error.message);
      throw error;
    }
  }

  async linkStudentToCourse(studentId, courseId) {
    try {
      // Obtener student actual
      const studentResponse = await this.client.get(`/student/${studentId}`);
      const student = studentResponse.data;
      
      // Obtener course actual
      const courseResponse = await this.client.get(`/course/${courseId}`);
      const course = courseResponse.data;

      // Actualizar relaciones bidireccionales
      const studentCourseIds = student.meta._course_ids || [];
      const courseStudentIds = course.meta._student_ids || [];

      if (!studentCourseIds.includes(courseId)) {
        studentCourseIds.push(courseId);
        await this.client.post(`/student/${studentId}`, {
          meta: { _course_ids: studentCourseIds }
        });
      }

      if (!courseStudentIds.includes(studentId)) {
        courseStudentIds.push(studentId);
        await this.client.post(`/course/${courseId}`, {
          meta: { _student_ids: courseStudentIds }
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Error in linkStudentToCourse:', error.message);
      throw error;
    }
  }

  async getUnits(courseId) {
    try {
      const response = await this.client.get('/unit', {
        params: {
          meta_key: '_course_id',
          meta_value: courseId,
          per_page: 100
        }
      });

      return response.data.map(unit => ({
        ...unit,
        cards: unit.meta._unit_cards || [],
        settings: unit.meta._unit_settings || {}
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
          meta_query: JSON.stringify([
            { key: '_student_id', value: studentId },
            { key: '_course_id', value: courseId },
            { key: '_unit_id', value: unitId }
          ]),
          per_page: 1
        }
      });

      let progress;
      let completedCardIds = [];
      
      if (searchResponse.data.length > 0) {
        progress = searchResponse.data[0];
        completedCardIds = progress.meta._completed_card_ids || [];
      }

      // Añadir nueva card completada (evitar duplicados)
      if (completedCardId && !completedCardIds.includes(completedCardId)) {
        completedCardIds.push(completedCardId);
      }

      // Obtener total de cards de la unidad
      const unit = await this.client.get(`/unit/${unitId}`);
      const totalCards = (unit.data.meta._unit_cards || []).length;
      const percent = totalCards > 0 ? Math.round((completedCardIds.length / totalCards) * 100) : 0;

      const progressData = {
        title: `Progreso ${studentId}-${courseId}-${unitId}`,
        status: 'publish',
        meta: {
          _student_id: studentId,
          _course_id: courseId,
          _unit_id: unitId,
          _completed_card_ids: completedCardIds,
          _percent: percent
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
          meta_query: JSON.stringify([
            { key: '_student_id', value: studentId },
            { key: '_course_id', value: courseId }
          ]),
          per_page: 100
        }
      });

      return response.data;
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
            _student_id: studentId,
            _course_id: courseId,
            _lineitem_id: result.lineItemId,
            _score_given: result.scoreGiven || 0,
            _score_maximum: result.scoreMaximum || 100,
            _activity_title: result.activityTitle || 'Actividad',
            _attempt_id: result.attemptId || null,
            _timestamp: result.timestamp || new Date().toISOString(),
            _provenance: 'lms'
          }
        };

        // Buscar grade existente por lineitem_id + student_id
        const searchResponse = await this.client.get('/grade', {
          params: {
            meta_query: JSON.stringify([
              { key: '_student_id', value: studentId },
              { key: '_lineitem_id', value: result.lineItemId }
            ]),
            per_page: 1
          }
        });

        if (searchResponse.data.length > 0) {
          // Actualizar existente
          const grade = searchResponse.data[0];
          await this.client.post(`/grade/${grade.id}`, gradeData);
          results.push({ ...grade, meta: gradeData.meta });
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
      const metaQuery = [
        { key: '_student_id', value: studentId },
        { key: '_course_id', value: courseId }
      ];

      if (unitId) {
        metaQuery.push({ key: '_unit_id', value: unitId });
      }

      const response = await this.client.get('/progress', {
        params: {
          meta_query: JSON.stringify(metaQuery),
          per_page: 100
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error in getProgress:', error.message);
      return [];
    }
  }
}

export default new WordPressClient();