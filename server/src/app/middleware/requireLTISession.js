import { getAuthFromState } from '../../database/db-utility';
import * as subjectHandler from '../handlers/v2/subject'
import * as studentHandler from '../handlers/v2/student'
import * as ddaStudentHandler from '../handlers/v2/dda/student'
import * as ddaCourseHandler from '../handlers/v2/dda/course'
import logger from '../../config/logger'

const requireLTISession = async (req, res, next) => {
    try {
        if (process.env.NODE_ENV == 'development') {
            const mockLti = require('../../../mockLti.json')
            req.ltiSession = mockLti
        } else {
            const sessionId = req.cookies?.ltiState || req.session?.ltiState

            logger.info({ 
                sessionId,
                cookiesLTIstate: req.cookies?.ltiState,
                sessionLTIstate: req.session?.ltiState
            },'requireLTISession => state')

            if (!sessionId) {
                return res.status(401).json({ error: 'No LTI session found' })
            }
        
            const auth = await getAuthFromState(sessionId)
            if (!auth?.jwt) {
                return res.status(401).json({ error: 'Invalid LTI session' })
            }
        
            req.ltiSession = {
                jwt: auth.jwt,
                sessionId: sessionId,
                bbStudentExternalId: auth.bbStudentExternalId,
                bbCourseExternalId: auth.bbCourseExternalId
            }
        }
        
        // get subject and student data from db
        const { bbCourseExternalId, jwt, bbStudentExternalId } = req.ltiSession
        logger.info({
            jwt,
            bbCourseExternalId,
            bbStudentExternalId
        },'requireLTISession => before searching course and student in DDA')
        
        const bbCourseId = await ddaCourseHandler.getBBid(bbCourseExternalId) // 129148
        const bbStudentId = await ddaStudentHandler.getBBid(bbStudentExternalId) // 1114143

        const subject = await subjectHandler.getOrCreate({
            name: jwt.body['https://purl.imsglobal.org/spec/lti/claim/context'].title,
            bbId: bbCourseId
        })
        const isAdminUrl = req.originalUrl.includes('v2/units') || req.originalUrl.includes('v2/results')
        const isStudent = jwt.body['https://purl.imsglobal.org/spec/lti/claim/roles']
            .includes('http://purl.imsglobal.org/vocab/lis/v2/membership#Learner')
        const isAdmin = jwt.body['https://purl.imsglobal.org/spec/lti/claim/roles']
            .includes('http://purl.imsglobal.org/vocab/lis/v2/membership#Instructor')
        let student = null

        // validate profiles
        if (isStudent && isAdminUrl) res.status(401).json({ error: 'Unauthorized' })
        else if (isAdmin && !isStudent && !isAdminUrl) res.status(401).json({ error: 'Unauthorized' })
        else {
            if (!isAdminUrl) {
                student = await studentHandler.getOrCreate({
                    name: jwt.body.name,
                    bbId: bbStudentId,
                    subject
                })
            }

            req.ltiSession = {
                ...req.ltiSession,
                bbStudentId,
                bbCourseId,
                subject,
                student,
                isStudent,
                isAdmin
            }
            logger.info('RequireLTISession => next')
            next()
        }
    } catch (error) {
        console.error('Session validation error:', error)
        res.status(401).json({ error: 'Session validation failed' })
    }
}

export default requireLTISession