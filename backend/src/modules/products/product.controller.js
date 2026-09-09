import { ProductService } from './product.service.js'
import { getPaginationParams, createPaginatedResponse } from '../../utils/pagination.js'

const productService = new ProductService()

export class ProductController {
  async create(req, res, next) {
    try {
      const product = await productService.createProduct(req.body)
      return res.status(201).json({ success: true, data: product })
    } catch (error) {
      next(error)
    }
  }

  async list(req, res, next) {
    try {
      const pagination = getPaginationParams(req.query)
      const { data, total } = await productService.listProducts(req.query, pagination)
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
      const product = await productService.getProductById(req.params.id)
      return res.status(200).json({ success: true, data: product })
    } catch (error) {
      next(error)
    }
  }

  async update(req, res, next) {
    try {
      const product = await productService.updateProduct(req.params.id, req.body)
      return res.status(200).json({ success: true, data: product })
    } catch (error) {
      next(error)
    }
  }

  async delete(req, res, next) {
    try {
      await productService.deleteProduct(req.params.id)
      return res.status(204).send()
    } catch (error) {
      next(error)
    }
  }

  async getPriceHistory(req, res, next) {
    try {
      const pagination = getPaginationParams(req.query)
      const { data, total } = await productService.getPriceHistory(req.params.id, pagination)
      return res.status(200).json({
        success: true,
        ...createPaginatedResponse(data, total, pagination.page, pagination.limit)
      })
    } catch (error) {
      next(error)
    }
  }

  async getStockHistory(req, res, next) {
    try {
      const pagination = getPaginationParams(req.query)
      const { data, total } = await productService.getStockHistory(req.params.id, pagination)
      return res.status(200).json({
        success: true,
        ...createPaginatedResponse(data, total, pagination.page, pagination.limit)
      })
    } catch (error) {
      next(error)
    }
  }

  async addStockMovement(req, res, next) {
    try {
      const movement = await productService.addStockMovement(req.params.id, req.body)
      return res.status(201).json({ success: true, data: movement })
    } catch (error) {
      next(error)
    }
  }
}