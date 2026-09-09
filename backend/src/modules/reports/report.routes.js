import { Router } from 'express'
import { ReportController } from './report.controller.js'

const router = Router()
const controller = new ReportController()

router.get('/sales', controller.sales)
router.get('/revenue', controller.revenue)
router.get('/top-products', controller.topProducts)
router.get('/top-services', controller.topServices)
router.get('/appointments', controller.appointments)

export default router