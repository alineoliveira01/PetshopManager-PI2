import { CategoryService } from './category.service.js'
import { getPaginationParams, createPaginatedResponse } from '../../utils/pagination.js'

const categoryService = new CategoryService()

export class CategoryController {
  async create(req, res, next) {
    try {
      const category = await categoryService.createCategory(req.body)
      return res.status(201).json({ success: true, data: category })
    } catch (error) {
      next(error)
    }
  }

  async list(req, res, next) {
    try {
      const pagination = getPaginationParams(req.query)
      const { data, total } = await categoryService.listCategories(pagination)
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
      const category = await categoryService.getCategoryById(req.params.id)
      return res.status(200).json({ success: true, data: category })
    } catch (error) {
      next(error)
    }
  }

  async update(req, res, next) {
    try {
      const category = await categoryService.updateCategory(req.params.id, req.body)
      return res.status(200).json({ success: true, data: category })
    } catch (error) {
      next(error)
    }
  }

  async delete(req, res, next) {
    try {
      await categoryService.deleteCategory(req.params.id)
      return res.status(204).send()
    } catch (error) {
      next(error)
    }
  }
}