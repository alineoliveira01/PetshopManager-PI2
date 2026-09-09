import { SaleService } from './sale.service.js'
import { getPaginationParams, createPaginatedResponse } from '../../utils/pagination.js'

const saleService = new SaleService()

export class SaleController {
  async create(req, res, next) {
    try {
      const sale = await saleService.createSale(req.body)
      return res.status(201).json({ success: true, data: sale })
    } catch (error) {
      next(error)
    }
  }

  async list(req, res, next) {
    try {
      const pagination = getPaginationParams(req.query)
      const { data, total } = await saleService.listSales(pagination)
      return res.status(200).json({
        success: true,
        ...createPaginatedResponse(data, total, pagination.page, pagination.limit)
      })
    } catch (error) {
      next(error)
    }
  }

  async getById(req, res, next) {
    try {
      const sale = await saleService.getSaleById(req.params.id)
      return res.status(200).json({ success: true, data: sale })
    } catch (error) {
      next(error)
    }
  }

  async cancel(req, res, next) {
    try {
      const sale = await saleService.cancelSale(req.params.id)
      return res.status(200).json({ success: true, data: sale })
    } catch (error) {
      next(error)
    }
  }
}