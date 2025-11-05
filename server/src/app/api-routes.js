import express from 'express';
import wpClient from './wp-client';
import { getAuthFromState } from '../database/db-utility';
import { getCachedLTIToken } from './lti-token-service';
import request from 'request';
import { getUnit } from './handlers/units'
import { getCourseUnits, getLearningRoutes } from './handlers/units'
import { getProgressByUnits } from './handlers/progress'
import * as columns from './handlers/columns'
import * as grades from './handlers/grades'
import * as students from './handlers/students'
import { getContentsByCourseId } from './handlers/content';

const router = express.Router();

// Middleware para verificar sesión LTI
const requireLTISession = async (req, res, next) => {
  try {
    const sessionId = req.cookies?.ltiState || req.session?.ltiState;
    if (!sessionId) {
      return res.status(401).json({ error: 'No LTI session found' });
    }

    const auth = await getAuthFromState(sessionId);
    if (!auth?.jwt) {
      return res.status(401).json({ error: 'Invalid LTI session' });
    }

    req.ltiSession = {
      jwt: auth.jwt,
      sessionId: sessionId,
      wpStudentId: auth.wpStudentId,
      wpCourseId: auth.wpCourseId,
      bbStudentExternalId: auth.bbStudentExternalId,
      bbCourseId: auth.bbCourseId
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
      context: jwt.body['https://purl.imsglobal.org/spec/lti/claim/context'] || {},
      wpStudentId: req.ltiSession.wpStudentId,
      wpCourseId: req.ltiSession.wpCourseId
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
    const wpCourseId = req.ltiSession.wpCourseId;
    if (!wpCourseId) {
      return res.json([]);
    }

    // Get the course from WordPress
    const courseResponse = await wpClient.client.get(`/course/${wpCourseId}`);
    const course = courseResponse.data;

    res.json([{
      id: course.id,
      title: course.title?.rendered || course.title,
      meta: course.meta
    }]);
  } catch (error) {
    console.error('Error getting courses:', error.message);
    res.json([]);
  }
});

// GET /api/courses/:courseId/units - unidades del curso
router.get('/courses/:courseId/units/:unitId', requireLTISession, async (req, res) => {
  try {
    const courseId = parseInt(req.params.courseId);
    const unitId = parseInt(req.params.unitId);
    const unit = await getUnit(unitId, courseId);

    res.json(unit);
  } catch (error) {
    console.error('Error getting unit:', error);
    res.status(500).json({ error: 'Failed to get course unit' });
  }
});

// GET /api/courses/:courseId/grades - notas del curso
router.get('/courses/:courseId/grades', requireLTISession, async (req, res) => {
  try {
    const wpStudentId = req.ltiSession.wpStudentId;
    const courseId = parseInt(req.params.courseId);

    if (!wpStudentId) {
      return res.json([]);
    }

    const grades = await wpClient.getGrades(wpStudentId, courseId);
    res.json(grades);
  } catch (error) {
    console.error('Error getting grades:', error.message);
    res.status(500).json({ error: 'Failed to get grades' });
  }
});

// GET /api/progress - progreso del usuario
router.get('/progress', requireLTISession, async (req, res) => {
  try {
    const wpStudentId = req.ltiSession.wpStudentId;
    const { courseId, unitId } = req.query;

    if (!wpStudentId) {
      return res.json([]);
    }

    const progress = await wpClient.getProgress(wpStudentId, parseInt(courseId), unitId ? parseInt(unitId) : null);
    res.json(progress);
  } catch (error) {
    console.error('Error in getProgress:', error.message);
    res.status(500).json({ error: 'Failed to get progress' });
  }
});

// POST /api/progress - actualizar progreso
router.post('/progress', requireLTISession, async (req, res) => {
  try {
    const wpStudentId = req.ltiSession.wpStudentId;
    const { unitId, completedCardId, courseId } = req.body;
    console.log('/progress wpStudentId => ',wpStudentId) 
    console.log('/progress courseId => ', courseId) 
    console.log('/progress unitId => ', unitId) 
    console.log('/progress completedCardId => ', completedCardId)
    
    if (!wpStudentId) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const progress = await wpClient.upsertProgress({
      studentId: wpStudentId,
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
// ??
router.post('/grades/refresh', requireLTISession, async (req, res) => {
  try {
    const jwt = req.ltiSession.jwt;
    const wpStudentId = req.ltiSession.wpStudentId;
    const wpCourseId = req.ltiSession.wpCourseId;
    const context = jwt.body['https://purl.imsglobal.org/spec/lti/claim/context'];
    const agsEndpoint = jwt.body['https://purl.imsglobal.org/spec/lti-ags/claim/endpoint'];

    if (!agsEndpoint) {
      return res.status(400).json({ error: 'AGS not available in this context' });
    }

    if (!wpStudentId || !wpCourseId) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Obtener token LTI para AGS
    const scope = 'https://purl.imsglobal.org/spec/lti-ags/scope/result.readonly';
    const token = await getCachedLTIToken(req.ltiSession.sessionId, jwt.body.aud, scope);

    console.log('/grades/refresh => token: ', token )
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
            uri: `${lineItem.id}/results?user_id=${jwt.body.sub}`,
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
      studentId: wpStudentId,
      courseId: wpCourseId,
      agsResults
    });

    res.json(grades);
  } catch (error) {
    console.error('Error refreshing grades:', error.message);
    res.status(500).json({ error: 'Failed to refresh grades from LMS' });
  }
});

router.get('/units', requireLTISession, async (req, res) => {
  console.log('-------------------\nunits');
  try {
    const studentId = req.ltiSession.wpStudentId;
    console.log('>>>>>>>>>>>> /units > studentId =>',studentId)

    const { bbStudentExternalId, bbCourseId } = req.ltiSession;

      
    const { courseId } = req.query
    // const courseId = /*req.query?.courseId ??*/ 50;
    // const course = (await getCourse(courseName))[0]

    /*
    const courseKey = courseName.split(' ')
                                .splice(0,2)
                                .join(' ')
    */

      // const { id : courseId } = course
      console.log('>>>>>>>>>>>> /units > courseId =>',courseId)

      const rawUnits = await getCourseUnits(courseId)
      console.log('>>>>>>>>>>>> /units > units =>', rawUnits)

      const progress = await getProgressByUnits(studentId, courseId)
      console.log('>>>>>>>>>>>> /units > progress =>', progress)

      const studentUnits = rawUnits.map(u => ({
        ...u,
        cards: u.cards.map(c => {
          // read card progress
          return {
            ...c,
            completed:
              progress[u.id]?.find(cardId => cardId == c.id)?.length > 0
          }
        })
      }))
/*
      const bUnits = studentUnits.map(u => ({
        ...u,
        learningRoutes: getLearningRoutes(u.cards)
      }))
        */

      const bbStudentId = await students.getStudentId(bbStudentExternalId)

      const contentKey = 'ContentId%7C'
      
      // search for cards related to blackBoard activities
      // to read their grades later
      const cardsContentIds = studentUnits.map(
        u => u.cards.filter(
          c => !c.completed && c.url.includes(contentKey)
        ).map(c => {
            return c.url.split(contentKey)[1].split('%')[0]
        })
      ).reduce((acc = [], a) => [...acc, ...a])


      const contentIds = [
        ...studentUnits.map(u => u.contentId), // units contents
        ...cardsContentIds // cards contents
      ]
      
      /*
      console.log('>>>>>>/units => contentIds', contentIds)
      const contents = await getContentsByCourseId(bbCourseId, contentIds)
      //  make only one request for al contents and filter for seached ids
      console.log('>>>>>>/units => contents', contents)
*/

      let allGrades = []
      const iContents = contentIds.length
      for (let i = 0; i<iContents; i++) {
        const currentContentId = contentIds[i]
        const columnId = await columns.getColumnIdByContent(bbCourseId, currentContentId)

        console.log('current Content', currentContentId)
        //get column
          console.log('AFteR GETTING COLUMN id', columnId)


        //get grade
        let grade = null
        if (!!columnId) {
          grade = await grades.getGrade(bbCourseId, columnId, bbStudentId)
        }
        allGrades.push({
          contentId: currentContentId,
          columnId,
          grade
        })
      }
/*
      const allGrades = await contents.map( async c => {
        const columnId = c.contentHandler?.gradeColumnId
        let grade = null
        if (!!columnId) {
          grade = await grades.getGrade(bbCourseId, columnId, bbStudentId)
        }
        return {
          contentId: c.id,
          columnId,
          grade
        }
      })
        */
      console.log('>>>>>>/units => grades', allGrades)

      const finalUnits = studentUnits.map(u => {
        let learningRouteIndex = null
        let evaluation = null
        let unitGrade = allGrades.find(g => g.contentId == u.contentId)?.grade
        console.log('grade => ',{unidad: u, unitGrade})
        if (!unitGrade || unitGrade?.status == "NeedsGrading" ) {
          learningRouteIndex = 1
          evaluation = 0
          unitGrade = {
            fake:true
          }
        } else {
          const {possible: maxScore, score} = unitGrade.displayGrade
          evaluation = score / maxScore
          console.log('evaluation =>' , evaluation)
          learningRouteIndex = evaluation >= 0.5
            ? (evaluation >= 0.8 ? 1 : 2 ) : 3
        }

        const cards = u.cards.map(c => {
          if (c.completed || !c.url.includes(contentKey)) return c
          //only blackboard activity cards
          const cardContentId = c.url.split(contentKey)[1]?.split('%')[0]
          const grade = allGrades.find(g => g.contentId == cardContentId)
          console.log('cards grade =>', { card: c.id, grade})
          if (!!grade) {
            //update 
            wpClient.upsertProgress({
              studentId,
              courseId: parseInt(courseId),
              unitId: parseInt(u.id),
              completedCardId: c.id
            });
          } 
          return {
            ...c,
            completed: !!grade,
            grade
          }
        })

        const learningRoutes = getLearningRoutes(cards)

        return {
          ...u,
          cards,
          learningRoutes,
          studentLearningRoute: learningRoutes[learningRouteIndex-1],
          studentLearningIndex: learningRouteIndex,
          studentGrade: {
            ...unitGrade,
            evaluation,
            learningRouteIndex
          }
        }
      })
      // map content to get their column_ids

      //getAllGrades:
      //  check if there is a enpoint to get all grades 
      //  and filter by column_ids instead of doing x 
      //  number on requests
      

      return res.json({
        success: true,
        units: finalUnits
      });
    } catch (error) {
      console.error('get Units failed:', error.response?.data);
      return res.status(500).json({
        error: error.message,
        details: error.response?.data,
        status: error.response?.status,
        suggestion: error.response?.status === 401 ? 'WordPress API Auth error ' : 'Unknown WordPress API error'
      });
    }
  })

  /*
router.get('/evaluationGrade', requireLTISession, async (req, res) => {
  console.log('-------------------/evaluationGrade');
  try {
    const { bbStudentExternalId, bbCourseId } = req.ltiSession;
    console.log('>>>>>>>>>>>> /evaluationGrade > studentId =>',studentId)
    console.log('>>>>>>>>>>>> /evaluationGrade >  req.ltiSession =>', req.ltiSession)
    //const jwt = req.ltiSession.jwt;

    const {  contentId } = req.query
    const studentId = await students.getStudentId(bbStudentExternalId)
    const columnId = await getColumnIdByContent(bbCourseId, contentId)
    console.log('evaluationGrade => columnId => ', columnId)

    const grade = await grades.getGrade(bbCourseId, columnId, studentId)
    console.log('evaluationGrade => grade => ', grade)

    return res.json({
      success: true,
      grade
    });
    } catch (error) {
      console.error('get evaluationGrade failed:', error.response?.data);
      return res.status(500).json({
        error: error.message,
        details: error.response?.data,
        status: error.response?.status,
        suggestion: error.response?.status === 401 ? 'WordPress API Auth error ' : 'Unknown WordPress API error'
      });
    }
  })
    */

export default router;