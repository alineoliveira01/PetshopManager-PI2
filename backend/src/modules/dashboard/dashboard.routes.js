import { Router } from 'express'
import { DashboardController } from './dashboard.controller.js'

const router = Router()
const controller = new DashboardController()

router.get('/', controller.getDashboard)

export default router