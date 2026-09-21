import express from 'express';

const router = express.Router();
// Units
router.post('/v2/units', requireLTISession,  async (req, res) => {
    try {
      const { bbCourseId } = req.ltiSession
        const subjectId = req.ltiSession.subject.id
        const data = { ...req.body, subjectId, bbCourseId }
        let updatedUnit
        if (!data.id) {
            updatedUnit = await unitsHandler.createUnit(data)
        } else {
            updatedUnit = await unitsHandler.updateUnit(data)
        }
        const units = await unitsHandler.getAllUnits(subjectId)
        return res.status(200).json({
            ok: true,
            updatedUnit,
            units
        })
    } catch (error) {
        return res.status(200).json({
            success: false,
            error: error?.message ?? 'unknown error'
        })
    } 
})
router.get('/v2/units', requireLTISession, async (req, res) => {
    try {
        const { subject } = req.ltiSession
        // const data = req.body
        const units = await unitsHandler.getAllUnits(subject.id)
        return res.status(200).json({
            ok: true,
            units,
            subject
        })
    } catch (error) {
        return res.status(200).json({
            success: false,
            error: error?.message ?? 'unknown error'
        })
    }
})

router.delete('/v2/units', requireLTISession,  async (req, res) => {
    try {
        const { subject, bbCourseId } = req.ltiSession        
        const { unit } = req.body
        await unitsHandler.deleteUnit(unit, subject.id, bbCourseId)
        const units = await unitsHandler.getAllUnits(subject.id)
        return res.status(200).json({
            ok: true,
            units
        })
    } catch (error) {
        return res.status(200).json({
            success: false,
            error: error?.message ?? 'unknown error'
        })
    } 
})


// Contents
router.get('/v2/units/:unitId/contents', requireLTISession, async (req, res) => {
    try {
        const { unitId } = req.params
        const contents = await contentsHandler.getAllContents(unitId)
        return res.status(200).json({
            ok: true,
            unitId,
            contents
        })
    } catch (error) {
        return res.status(200).json({
            success: false,
            error: error?.message ?? 'unknown error'
        })
    }
})

router.post('/v2/units/:unitId/contents', requireLTISession, async (req, res) => {
    try {
        const data = req.body
        let content
        if (!data.id) {
            content = await contentsHandler.createContent(data)
        } else {
            content = await contentsHandler.updateContent(data)
        }
        return res.status(200).json({
            ok: true,
            content
        })
    } catch (error) {
        return res.status(200).json({
            success: false,
            error: error?.message ?? 'unknown error'
        })
    }

})

router.delete('/v2/units/:unitId/contents', requireLTISession, async (req, res) => {
    try {
        const { unitId } = req.params
        await contentsHandler.deleteContent(unitId)
        return res.status(200).json({
            ok: true
        })
    } catch (error) {
        return res.status(200).json({
            success: false,
            error: error?.message ?? 'unknown error'
        })
    }
})



//
router.post('/v2/units/:unitId/lr/schema', requireLTISession, async (req, res) => {
    try {
        const { unitId } = req.params
        const data = req.body
        await LRHandler.updateSchema(unitId, data)
        //TODO: find learningRouteData registers
        const learningRoutes = await LRHandler.getLearningRoutes(unitId)
    
        return res.status(200).json({
            ok: true,
            learningRoutes
        })
    } catch (error) {
        return res.status(200).json({
            success: false,
            error: error?.message ?? 'unknown error'
        })
    }
})

router.get('/v2/units/:unitId/lr', requireLTISession, async (req, res) => {
    try {
        const { unitId } = req.params
        const learningRoutes = await LRHandler.getLearningRoutes(unitId)
    
        return res.status(200).json({
            ok: true,
            learningRoutes
        })
    } catch (error) {
        return res.status(200).json({
            success: false,
            error: error?.message ?? 'unknown error'
        })
    }
})

router.post('/v2/units/:unitId/lr/:ldId/contents', requireLTISession, async (req, res) => {
    try {
        const { unitId, ldId } = req.params
        const data = req.body
        const update = await LRHandler.updateLRContents(ldId, data)
    
        console.log('POST => /v2/units/:unitId/lr/:ldId/contents => update', update)
        //TODO: find learningRouteData registers
        const learningRoutes = await LRHandler.getLearningRoutes(unitId)
    
        return res.status(200).json({
            ok: true,
            learningRoutes
        })
    } catch (error) {
        return res.status(200).json({
            success: false,
            error: error?.message ?? 'unknown error'
        })
    }
})


router.post('/v2/units/positions' , requireLTISession, async (req, res) => {
    try {
        const { bbCourseId, subject } = req.ltiSession
        const { units: unitsToUpdate } = req.body
        console.log('/v2/units/positions => units', unitsToUpdate.length)
        const update = await unitsHandler.updatePositions(unitsToUpdate, bbCourseId)
        const units = await unitsHandler.getAllUnits(subject.id)
        return res.status(200).json({
            ok: true,
            update,
            units
        })
    } catch (error) {
        return res.status(200).json({
            success: false,
            error: error?.message ?? 'unknown error'
        })
    }
})


export default router