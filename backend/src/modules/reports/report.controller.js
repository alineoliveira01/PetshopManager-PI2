import { ReportService } from './report.service.js'

const reportService = new ReportService()

export class ReportController {
  async sales(req, res, next) {
    try {
      const data = await reportService.getSalesReport(req.query)
      return res.status(200).json({ success: true, data })
    } catch (error) {
      next(error)
    }
  }

  async revenue(req, res, next) {
    try {
      const data = await reportService.getRevenueReport(req.query)
      return res.status(200).json({ success: true, data })
    } catch (error) {
      next(error)
    }
  }

  async topProducts(req, res, next) {
    try {
      const data = await reportService.getTopProducts(req.query)
      return res.status(200).json({ success: true, data })
    } catch (error) {
      next(error)
    }
  }

  async topServices(req, res, next) {
    try {
      const data = await reportService.getTopServices(req.query)
      return res.status(200).json({ success: true, data })
    } catch (error) {
      next(error)
    }
  }

  async appointments(req, res, next) {
    try {
      const data = await reportService.getAppointmentsReport(req.query)
      return res.status(200).json({ success: true, data })
    } catch (error) {
      next(error)
    }
  }
}