import express from 'express';
import wpClient from './wp-client';
import { getCachedLTIToken } from './lti-token-service';
import { getAuthFromState } from '../database/db-utility';
import request from 'request';

const router = express.Router();

// Middleware para verificar sesión LTI
const requireLTISession = async (req, res, next) => {
  try {
    const sessionId = req.session?.ltiState || req.cookies?.ltiState;
    if (!sessionId) {
      return res.status(401).json({ error: 'No LTI session found' });
    }

    const auth = await getAuthFromState(sessionId);
    if (!auth?.jwt) {
      return res.status(401).json({ error: 'Invalid LTI session' });
    }

    req.ltiSession = {
      jwt: auth.jwt,
      sessionId: sessionId
    };
    next();
  } catch (error) {
    console.error('Session validation error:', error);
    res.status(401).json({ error: 'Session validation failed' });
  }
};

// GET /api/me - datos del usuario en sesión
router.get('/me', requireLTISession, (req, res) => {
  try {
    const jwt = req.ltiSession.jwt;
    const user = {
      sub: jwt.body.sub,
      name: jwt.body.name,
      email: jwt.body.email,
      given_name: jwt.body.given_name,
      family_name: jwt.body.family_name,
      roles: jwt.body['https://purl.imsglobal.org/spec/lti/claim/roles'] || [],
      context: jwt.body['https://purl.imsglobal.org/spec/lti/claim/context'] || {}
    };

    res.json(user);
  } catch (error) {
    console.error('Error getting user data:', error);
    res.status(500).json({ error: 'Failed to get user data' });
  }
});

// GET /api/courses - cursos del usuario
router.get('/courses', requireLTISession, async (req, res) => {
  try {
    const jwt = req.ltiSession.jwt;
    const sub = jwt.body.sub;

    // Buscar student en WP
    const students = await wpClient.client.get('/student', {
      params: {
        meta_key: '_lms_sub',
        meta_value: sub,
        per_page: 1
      }
    });

    if (students.data.length === 0) {
      return res.json([]);
    }

    const student = students.data[0];
    const courseIds = student.meta._course_ids || [];

    if (courseIds.length === 0) {
      return res.json([]);
    }

    // Obtener cursos
    const courses = await wpClient.client.get('/course', {
      params: {
        include: courseIds.join(','),
        per_page: 100
      }
    });

    res.json(courses.data);
  } catch (error) {
    console.error('Error getting courses:', error);
    res.status(500).json({ error: 'Failed to get courses' });
  }
});

// GET /api/courses/:courseId/units - unidades del curso
router.get('/courses/:courseId/units', requireLTISession, async (req, res) => {
  try {
    const courseId = parseInt(req.params.courseId);
    const units = await wpClient.getUnits(courseId);
    res.json(units);
  } catch (error) {
    console.error('Error getting units:', error);
    res.status(500).json({ error: 'Failed to get units' });
  }
});

// GET /api/courses/:courseId/grades - notas del curso
router.get('/courses/:courseId/grades', requireLTISession, async (req, res) => {
  try {
    const jwt = req.ltiSession.jwt;
    const sub = jwt.body.sub;
    const courseId = parseInt(req.params.courseId);

    // Buscar student en WP
    const students = await wpClient.client.get('/student', {
      params: {
        meta_key: '_lms_sub',
        meta_value: sub,
        per_page: 1
      }
    });

    if (students.data.length === 0) {
      return res.json([]);
    }

    const studentId = students.data[0].id;
    const grades = await wpClient.getGrades(studentId, courseId);
    res.json(grades);
  } catch (error) {
    console.error('Error getting grades:', error);
    res.status(500).json({ error: 'Failed to get grades' });
  }
});

// GET /api/progress - progreso del usuario
router.get('/progress', requireLTISession, async (req, res) => {
  try {
    const jwt = req.ltiSession.jwt;
    const sub = jwt.body.sub;
    const { courseId, unitId } = req.query;

    // Buscar student en WP
    const students = await wpClient.client.get('/student', {
      params: {
        meta_key: '_lms_sub',
        meta_value: sub,
        per_page: 1
      }
    });

    if (students.data.length === 0) {
      return res.json([]);
    }

    const studentId = students.data[0].id;
    const progress = await wpClient.getProgress(studentId, parseInt(courseId), unitId ? parseInt(unitId) : null);
    res.json(progress);
  } catch (error) {
    console.error('Error getting progress:', error);
    res.status(500).json({ error: 'Failed to get progress' });
  }
});

// POST /api/progress - actualizar progreso
router.post('/progress', requireLTISession, async (req, res) => {
  try {
    const jwt = req.ltiSession.jwt;
    const sub = jwt.body.sub;
    const { unitId, completedCardId, courseId } = req.body;

    // Buscar student en WP
    const students = await wpClient.client.get('/student', {
      params: {
        meta_key: '_lms_sub',
        meta_value: sub,
        per_page: 1
      }
    });

    if (students.data.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const studentId = students.data[0].id;
    const progress = await wpClient.upsertProgress({
      studentId,
      courseId: parseInt(courseId),
      unitId: parseInt(unitId),
      completedCardId
    });

    res.json(progress);
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({ error: 'Failed to update progress' });
  }
});

// POST /api/grades/refresh - actualizar notas desde LMS
router.post('/grades/refresh', requireLTISession, async (req, res) => {
  try {
    const jwt = req.ltiSession.jwt;
    const sessionId = req.ltiSession.sessionId;
    const sub = jwt.body.sub;
    const context = jwt.body['https://purl.imsglobal.org/spec/lti/claim/context'];
    const agsEndpoint = jwt.body['https://purl.imsglobal.org/spec/lti-ags/claim/endpoint'];

    if (!agsEndpoint) {
      return res.status(400).json({ error: 'AGS not available in this context' });
    }

    // Buscar student en WP
    const students = await wpClient.client.get('/student', {
      params: {
        meta_key: '_lms_sub',
        meta_value: sub,
        per_page: 1
      }
    });

    if (students.data.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const studentId = students.data[0].id;

    // Buscar course en WP
    const courses = await wpClient.client.get('/course', {
      params: {
        meta_key: '_lms_context_id',
        meta_value: context.id,
        per_page: 1
      }
    });

    if (courses.data.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const courseId = courses.data[0].id;

    // Obtener token LTI para AGS
    const scope = 'https://purl.imsglobal.org/spec/lti-ags/scope/result.readonly';
    const token = await getCachedLTIToken(sessionId, jwt.body.aud, scope);

    // Obtener line items
    const lineItemsResponse = await new Promise((resolve, reject) => {
      const options = {
        method: 'GET',
        uri: agsEndpoint.lineitems,
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      request(options, (err, response, body) => {
        if (err) {
          reject(err);
        } else if (response.statusCode !== 200) {
          reject(new Error(`AGS LineItems failed: ${response.statusCode}`));
        } else {
          resolve(JSON.parse(body));
        }
      });
    });

    // Obtener results para cada line item
    const agsResults = [];
    for (const lineItem of lineItemsResponse) {
      try {
        const resultsResponse = await new Promise((resolve, reject) => {
          const options = {
            method: 'GET',
            uri: `${lineItem.id}/results?user_id=${sub}`,
            headers: {
              Authorization: `Bearer ${token}`
            }
          };

          request(options, (err, response, body) => {
            if (err) {
              reject(err);
            } else if (response.statusCode !== 200) {
              console.warn(`AGS Results failed for ${lineItem.id}: ${response.statusCode}`);
              resolve([]);
            } else {
              resolve(JSON.parse(body));
            }
          });
        });

        for (const result of resultsResponse) {
          agsResults.push({
            lineItemId: lineItem.id,
            scoreGiven: result.scoreGiven,
            scoreMaximum: result.scoreMaximum,
            activityTitle: lineItem.label,
            attemptId: result.id,
            timestamp: result.timestamp
          });
        }
      } catch (error) {
        console.warn(`Failed to get results for line item ${lineItem.id}:`, error.message);
      }
    }

    // Guardar en WordPress
    const grades = await wpClient.upsertGradesFromAGS({
      studentId,
      courseId,
      agsResults
    });

    res.json(grades);
  } catch (error) {
    console.error('Error refreshing grades:', error);
    res.status(500).json({ error: 'Failed to refresh grades from LMS' });
  }
});

export default router;