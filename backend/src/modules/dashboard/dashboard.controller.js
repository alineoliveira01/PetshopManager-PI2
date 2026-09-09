import { DashboardService } from './dashboard.service.js'

const dashboardService = new DashboardService()

export class DashboardController {
  async getDashboard(req, res, next) {
    try {
      const data = await dashboardService.getDashboardData(req.query)
      return res.status(200).json({ success: true, data })
    } catch (error) {
      next(error)
    }
  }
}