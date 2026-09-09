import { StockService } from './stock.service.js'
import { getPaginationParams, createPaginatedResponse } from '../../utils/pagination.js'

const stockService = new StockService()

export class StockController {
  async create(req, res, next) {
    try {
      const movement = await stockService.addMovement(req.params.productId, req.body)
      return res.status(201).json({ success: true, data: movement })
    } catch (error) {
      next(error)
    }
  }

  async list(req, res, next) {
    try {
      const pagination = getPaginationParams(req.query)
      const { data, total } = await stockService.listMovements(req.query, pagination)
      return res.status(200).json({
        success: true,
        ...createPaginatedResponse(data, total, pagination.page, pagination.limit)
      })
    } catch (error) {
      next(error)
    }
  }
}