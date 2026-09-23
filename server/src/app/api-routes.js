import express from 'express';
import unitsRoutes from './routes/units'
import dashboardRoutes from './routes/dashboard'
import reportsRoutes from './routes/reports'

const router = express.Router()

router.use(unitsRoutes)
router.use(dashboardRoutes)
router.use(reportsRoutes)

export default router