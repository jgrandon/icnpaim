import axios from 'axios';
import crypto from 'crypto';

const baseURL = process.env.WP_API_BASE || 'https://icnpaim.cl/wp-json/wp/v2';
const BASIC_AUTH = process.env.WP_BASIC_AUTH;
const JWT_TOKEN = process.env.WP_JWT;

const shortHash = (s) => crypto.createHash('sha1').update(s).digest('hex').slice(0, 10);
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

class WordPressClient {
  constructor() {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    // Setup authentication
    this.client.interceptors.request.use((config) => {
      if (JWT_TOKEN) {
        config.headers.Authorization = `Bearer ${JWT_TOKEN}`;
      } else if (BASIC_AUTH) {
        config.headers.Authorization = BASIC_AUTH.startsWith('Basic') ? BASIC_AUTH : `Basic ${BASIC_AUTH}`;
      } else {
        // Fallback to basic auth with env vars
        const username = process.env.WORDPRESS_API_USER;
        const password = process.env.WORDPRESS_API_PASSWORD;
        if (username && password) {
          const auth = Buffer.from(`${username}:${password}`).toString('base64');
          config.headers.Authorization = `Basic ${auth}`;
        }
      }
      return config;
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

  async getBySlug(type, slugValue) {
    try {
      const response = await this.client.get(`/${type}`, {
        params: { slug: slugValue, per_page: 1 }
      });
      return Array.isArray(response.data) && response.data.length ? response.data[0] : null;
    } catch (error) {
      console.error(`Error getting ${type} by slug:`, error.message);
      return null;
    }
  }

  async create(type, payload) {
    const response = await this.client.post(`/${type}`, payload);
    return response.data;
  }

  async update(type, id, payload) {
    const response = await this.client.post(`/${type}/${id}`, payload);
    return response.data;
  }

  async findOrCreateStudent({ sub, email, name }) {
    try {
      const slugValue = `student-${shortHash(sub)}`;
      let post = await this.getBySlug('student', slugValue);
      
      const payload = {
        title: name || email || sub,
        slug: slugValue,
        status: 'publish',
        meta: {
          lms_sub: sub,
          email: email || '',
          full_name: name || '',
          course_ids: post?.meta?.course_ids || '[]'
        }
      };
      
      if (post) {
        post = await this.update('student', post.id, payload);
      } else {
        post = await this.create('student', payload);
      }
      
      return post;
    } catch (error) {
      console.error('Error in findOrCreateStudent:', error.message);
      throw error;
    }
  }

  async findOrCreateCourse({ contextId, title, label }) {
    try {
      const slugValue = `course-${shortHash(contextId)}`;
      let post = await this.getBySlug('course', slugValue);
      
      const payload = {
        title: title || label || contextId,
        slug: slugValue,
        status: 'publish',
        meta: {
          lms_context_id: contextId,
          lms_context_label: label,
          lms_context_title: title,
          student_ids: post?.meta?.student_ids || '[]'
        }
      };
      
      if (post) {
        post = await this.update('course', post.id, payload);
      } else {
        post = await this.create('course', payload);
        // Create sample units for new courses
        await this.createSampleUnits(post.id);
      }

      return post;
    } catch (error) {
      console.error('Error in findOrCreateCourse:', error.message);
      throw error;
    }
  }

  async linkStudentToCourse(studentId, courseId) {
    try {
      const [student, course] = await Promise.all([
        this.client.get(`/student/${studentId}`),
        this.client.get(`/course/${courseId}`)
      ]);
      
      const sMeta = student.data.meta || {};
      const cMeta = course.data.meta || {};
      
      const courseIds = new Set([
        ...(typeof sMeta.course_ids === 'string' ? JSON.parse(sMeta.course_ids) : (sMeta.course_ids || [])),
        courseId
      ]);
      const studentIds = new Set([
        ...(typeof cMeta.student_ids === 'string' ? JSON.parse(cMeta.student_ids) : (cMeta.student_ids || [])),
        studentId
      ]);
      
      await this.update('student', studentId, { meta: { ...sMeta, course_ids: JSON.stringify([...courseIds]) } });
      await this.update('course', courseId, { meta: { ...cMeta, student_ids: JSON.stringify([...studentIds]) } });
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
          per_page: 100,
          orderby: 'menu_order',
          order: 'asc'
        }
      });

      // Filter by course_id meta field
      return response.data.filter(unit => {
        const unitCourseId = unit.meta?.course_id;
        return unitCourseId == courseId;
      }).map(unit => ({
        ...unit,
        cards: this.parseJsonMeta(unit.meta?.unit_cards) || [],
        settings: this.parseJsonMeta(unit.meta?.unit_settings) || {}
      }));
    } catch (error) {
      console.error('Error in getUnits:', error.message);
      return [];
    }
  }

  async upsertProgress({ studentId, courseId, unitId, completedCardId }) {
    try {
      const slugValue = `progress-${studentId}-${courseId}-${unitId}`;
      let post = await this.getBySlug('progress', slugValue);
      
      const unit = await this.client.get(`/unit/${unitId}`);
      const unitCards = this.parseJsonMeta(unit.data.meta?.unit_cards) || [];
      const totalCards = unitCards.length;
      
      if (!post) {
        const meta = {
          student_id: studentId,
          course_id: courseId,
          unit_id: unitId,
          completed_card_ids: JSON.stringify([completedCardId]),
          percent: totalCards ? Math.round((1 / totalCards) * 100) : 0
        };
        return await this.create('progress', { title: slugValue, slug: slugValue, status: 'publish', meta });
      }
      
      const meta = post.meta || {};
      const completedCardIds = new Set([
        ...(this.parseJsonMeta(meta.completed_card_ids) || []),
        completedCardId
      ]);
      const percent = totalCards ? Math.round((completedCardIds.size / totalCards) * 100) : 0;

      return await this.update('progress', post.id, {
        meta: { ...meta, completed_card_ids: JSON.stringify([...completedCardIds]), percent }
      });
    } catch (error) {
      console.error('Error in upsertProgress:', error.message);
      throw error;
    }
  }

  async getGrades(studentId, courseId) {
    try {
      const response = await this.client.get('/grade', {
        params: {
          per_page: 100
        }
      });

      // Filtrar por course_id
      return response.data.filter(grade => 
        grade.meta?.student_id == studentId && grade.meta?.course_id == courseId
      );
    } catch (error) {
      console.error('Error in getGrades:', error.message);
      return [];
    }
  }

  async upsertGradesFromAGS({ studentId, courseId, agsResults }) {
    try {
      const results = [];
      
      for (const result of agsResults) {
        const slugValue = `grade-${studentId}-${courseId}-${shortHash(result.lineItemId + (result.attemptId || ''))}`;
        const existing = await this.getBySlug('grade', slugValue);
        
        const meta = {
          student_id: studentId,
          course_id: courseId,
          lineitem_id: result.lineItemId,
          score_given: result.scoreGiven || 0,
          score_maximum: result.scoreMaximum || 100,
          activity_title: result.activityTitle || 'Actividad',
          attempt_id: result.attemptId || '',
          timestamp: result.timestamp || new Date().toISOString(),
          provenance: 'lms'
        };
        
        const payload = {
          title: meta.activity_title || slugValue,
          slug: slugValue,
          status: 'publish',
          meta
        };

        if (existing) {
          const updated = await this.update('grade', existing.id, payload);
          results.push(updated);
        } else {
          const created = await this.create('grade', payload);
          results.push(created);
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
          per_page: 100
        }
      });

      // Filtrar por course_id y opcionalmente unit_id
      return response.data.filter(progress => {
        const matchesCourse = progress.meta?.course_id == courseId;
        const matchesStudent = progress.meta?.student_id == studentId;
        const matchesUnit = unitId ? progress.meta?.unit_id == unitId : true;
        return matchesCourse && matchesStudent && matchesUnit;
      });
    } catch (error) {
      console.error('Error in getProgress:', error.message);
      return [];
    }
  }

  async createSampleUnits(courseId) {
    try {
      const sampleUnits = [
        {
          title: 'Unidad 1: Introducción',
          cards: [
            {
              id: 'card-1-1',
              title: 'Video: Bienvenida al curso',
              url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
              tipoActividad: 'video',
              color: '#e53e3e',
              peso: 1,
              estado: 'pendiente'
            },
            {
              id: 'card-1-2',
              title: 'Lectura: Conceptos básicos',
              url: 'https://example.com/lectura1',
              tipoActividad: 'lectura',
              color: '#3182ce',
              peso: 2,
              estado: 'pendiente'
            },
            {
              id: 'card-1-3',
              title: 'Quiz: Evaluación inicial',
              url: 'https://forms.gle/example1',
              tipoActividad: 'quiz',
              color: '#d69e2e',
              peso: 3,
              estado: 'pendiente'
            }
          ]
        },
        {
          title: 'Unidad 2: Desarrollo',
          cards: [
            {
              id: 'card-2-1',
              title: 'Video: Conceptos avanzados',
              url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
              tipoActividad: 'video',
              color: '#e53e3e',
              peso: 1,
              estado: 'pendiente'
            },
            {
              id: 'card-2-2',
              title: 'Recurso: Documentación',
              url: 'https://example.com/docs',
              tipoActividad: 'recurso',
              color: '#38a169',
              peso: 2,
              estado: 'pendiente'
            }
          ]
        }
      ];
      
      for (const unitData of sampleUnits) {
        const unitResponse = await this.create('unit', {
          title: unitData.title,
          status: 'publish',
          meta: {
            course_id: courseId,
            unit_cards: JSON.stringify(unitData.cards),
            unit_settings: JSON.stringify({})
          }
        });
      }
    } catch (error) {
      console.error('Error creando unidades:', error.message);
    }
  }
  
  parseJsonMeta(value) {
    if (!value) return null;
    if (typeof value === 'string') {
      try { return JSON.parse(value); } catch { return null; }
    }
    return value;
  }
}

export default new WordPressClient();