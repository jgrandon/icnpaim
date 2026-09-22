import express from 'express';
import requireLTISession from '../middleware/requireLTISession'
import * as LRHandler from '../handlers/v2/learningRoutes'
import * as dashboardHandler from '../handlers/v2/dashboard'
import * as ddaGradesHandler from '../handlers/v2/dda/grades'
import logger from '../../config/logger'

const router = express.Router();

router.get('/v2/dashboard', requireLTISession, async (req, res) => {
    try {
        const {
            bbCourseId,
            subject,
            student,
            bbStudentId
        } = req.ltiSession
        logger.info({bbCourseId, bbStudentId}, '/v2/dashboard => LTI session => ')
        logger.info({data: subject.id}, '/v2/dashboard => LTI subjectId => ')
        
        //iterate units and cards to set progress
        const units = await dashboardHandler.getUnitsWithCards(subject.id, student.id)
        logger.info({units}, '/v2/dashboard => units => ')
    
        //get all content ids in cards
        const contentIds = units.map(
            u => u.cards.filter(
                c => !!c.contentId
            ).map(c => c.contentId)
        ).reduce((acc = [], a) => [ ...acc, ...a ], [])
    
        
        //query to get all course higher score grades from every student
        const ddaGrades = await ddaGradesHandler.getStudentGrades(bbStudentId, bbCourseId)
            
        let allLR = await LRHandler.getAllUnitsLearningRoutes(subject.id)
    
        const __DEFAULT_STUDENT_LR_INDEX = 1
        let fullUnits = []
        for( let i=0; i < units.length; i++ ) {
            const currentUnit = units[i]
            const currentLR = allLR[currentUnit.id]

            //assign grade to content
            let cards = []
            for( let x=0; x < currentUnit.cards.length; x++ ) {
                const c = currentUnit.cards[x]
                const grade = ddaGrades.find(g => g.contentId == c.contentId)
                if (grade /*?.grade?.status == 'Graded'*/) {
                    // notify progress
                    await LRHandler.updateContentProgress({
                        studentId: student.id,
                        contentId: c.id,
                    })
                }
                cards.push({
                    ...c,
                    grade,
                    completed: c.completed || !!grade
                })
            }
            
            let studentLearningIndex = null
            let studentLearningRoute = []
            let unitGrade = null

            try {
                    const evaluationTitle = currentUnit.position < 2
                        ? 'prueba de conocimientos iniciales'
                        : `${calculatedGradeKeyword} ${(currentUnit.position - 1)}`.toLowerCase()

                    unitGrade = ddaGrades.find(g => 
                        g.contentTitle.toLowerCase().includes(evaluationTitle))

                        // unitGrade = ddaGrades.find(g => g.gradebookId == currentUnit.evaluationId)
                        //await grades.getGrade(bbCourseId, currentUnit.evaluationId, bbStudentId)
                    logger.info({unitGrade}, 'unitGrade =>')
                    const score = (unitGrade.score * 6 / unitGrade.possible) + 1
                    logger.info({score}, 'score =>')

                    studentLearningIndex = currentLR.find(
                        lr => (lr.minGrade < score && lr.maxGrade >= score)
                    )?.level

                    studentLearningRoute = currentLR[studentLearningIndex - 1].contents.map( content => {
                        const completed = cards.find(c => content.id == c.id)?.completed ?? false
                        return { ...content, completed }
                    })
            } catch (error) {
                logger.error({ error }, 'units grade error =>')
                studentLearningIndex = null
                studentLearningRoute = []
                unitGrade = null
            } 

            fullUnits.push({
                ...currentUnit,
                unitGrade,
                cards,
                learningRoutes: currentLR,
                studentLearningRoute,
                studentLearningIndex,
            })
        }
    
        return res.status(200).json({
            success: true,
            units: fullUnits,
            subject,
            student,
            ddaGrades
        })
      
    } catch (error) {
        logger.error({ error }, 'Error in /v2/dashboard')
        return res.status(500).json({
            success: false,
            error: error?.message ?? 'unknown error'
        })
    } 
})

router.post('/v2/dashboard/progress' , requireLTISession, async (req, res) => {
    try {
        //const { unitId, ldId } = req.params
        const contentId = req.body.completedCardId
        const { student } = req.ltiSession
        const update = await LRHandler.updateContentProgress({
            studentId: student.id,
            contentId,
        })
        return res.status(200).json({
            ok: true,
            update
        })
    } catch (error) {
        logger.error({error}, '/v2/dashboard/progress:: Error while informing student content progress')
        return res.status(200).json({
            success: false,
            error: error?.message ?? 'unknown error'
        })
    }
})

export default router