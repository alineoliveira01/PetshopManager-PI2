import { CustomerService } from './customer.service.js'
import { getPaginationParams, createPaginatedResponse } from '../../utils/pagination.js'

const customerService = new CustomerService()

export class CustomerController {
  async create(req, res, next) {
    try {
      const customer = await customerService.createCustomer(req.body)
      return res.status(201).json({ success: true, data: customer })
    } catch (error) {
      next(error)
    }
  }

  async list(req, res, next) {
    try {
      const pagination = getPaginationParams(req.query)
      const { data, total } = await customerService.listCustomers(req.query, pagination)
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
      const customer = await customerService.getCustomerById(req.params.id)
      return res.status(200).json({ success: true, data: customer })
    } catch (error) {
      next(error)
    }
  }

  async update(req, res, next) {
    try {
      const customer = await customerService.updateCustomer(req.params.id, req.body)
      return res.status(200).json({ success: true, data: customer })
    } catch (error) {
      next(error)
    }
  }

  async delete(req, res, next) {
    try {
      await customerService.deleteCustomer(req.params.id)
      return res.status(204).send()
    } catch (error) {
      next(error)
    }
  }
}