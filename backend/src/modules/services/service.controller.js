import { ServiceService } from './service.service.js'
import { getPaginationParams, createPaginatedResponse } from '../../utils/pagination.js'

const serviceService = new ServiceService()

export class ServiceController {
  async create(req, res, next) {
    try {
      const service = await serviceService.createService(req.body)
      return res.status(201).json({ success: true, data: service })
    } catch (error) {
      next(error)
    }
  }

  async list(req, res, next) {
    try {
      const pagination = getPaginationParams(req.query)
      const { data, total } = await serviceService.listServices(pagination)
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
      const service = await serviceService.getServiceById(req.params.id)
      return res.status(200).json({ success: true, data: service })
    } catch (error) {
      next(error)
    }
  }

  async update(req, res, next) {
    try {
      const service = await serviceService.updateService(req.params.id, req.body)
      return res.status(200).json({ success: true, data: service })
    } catch (error) {
      next(error)
    }
  }

  async delete(req, res, next) {
    try {
      await serviceService.deleteService(req.params.id)
      return res.status(204).send()
    } catch (error) {
      next(error)
    }
  }
}