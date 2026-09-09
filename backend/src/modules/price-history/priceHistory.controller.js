import { PriceHistoryService } from './priceHistory.service.js'
import { getPaginationParams, createPaginatedResponse } from '../../utils/pagination.js'

const priceHistoryService = new PriceHistoryService()

export class PriceHistoryController {
  async listAll(req, res, next) {
    try {
      const pagination = getPaginationParams(req.query)
      const { data, total } = await priceHistoryService.listAllHistory(req.query, pagination)
      return res.status(200).json({
        success: true,
        ...createPaginatedResponse(data, total, pagination.page, pagination.limit)
      })
    } catch (error) {
      next(error)
    }
  }

  async listByProduct(req, res, next) {
    try {
      const pagination = getPaginationParams(req.query)
      const { data, total } = await priceHistoryService.getHistoryByProductId(req.params.productId, pagination)
      return res.status(200).json({
        success: true,
        ...createPaginatedResponse(data, total, pagination.page, pagination.limit)
      })
    } catch (error) {
      next(error)
    }
  }
}