import { EmployeeService } from './employee.service.js'
import { getPaginationParams, createPaginatedResponse } from '../../utils/pagination.js'

const employeeService = new EmployeeService()

export class EmployeeController {
  async create(req, res, next) {
    try {
      const employee = await employeeService.createEmployee(req.body)
      return res.status(201).json({ success: true, data: employee })
    } catch (error) {
      next(error)
    }
  }

  async list(req, res, next) {
    try {
      const pagination = getPaginationParams(req.query)
      const { data, total } = await employeeService.listEmployees(pagination)
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
      const employee = await employeeService.getEmployeeById(req.params.id)
      return res.status(200).json({ success: true, data: employee })
    } catch (error) {
      next(error)
    }
  }

  async update(req, res, next) {
    try {
      const employee = await employeeService.updateEmployee(req.params.id, req.body)
      return res.status(200).json({ success: true, data: employee })
    } catch (error) {
      next(error)
    }
  }

  async delete(req, res, next) {
    try {
      await employeeService.deleteEmployee(req.params.id)
      return res.status(204).send()
    } catch (error) {
      next(error)
    }
  }

  async getAppointments(req, res, next) {
    try {
      const pagination = getPaginationParams(req.query)
      const { data, total } = await employeeService.getEmployeeAppointments(req.params.id, pagination)
      return res.status(200).json({
        success: true,
        ...createPaginatedResponse(data, total, pagination.page, pagination.limit)
      })
    } catch (error) {
      next(error)
    }
  }
}