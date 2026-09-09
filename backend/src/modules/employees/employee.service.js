import prisma from '../../database/prisma.js'
import { AppError } from '../../errors/AppError.js'

export class EmployeeService {
  async createEmployee(data) {
    const existing = await prisma.employee.findUnique({
      where: { email: data.email }
    })
    if (existing) {
      throw new AppError('E-mail já cadastrado para outro funcionário', 409, 'EMPLOYEE_EXISTS')
    }
    return prisma.employee.create({ data })
  }

  async listEmployees(pagination) {
    const [data, total] = await Promise.all([
      prisma.employee.findMany({
        where: { deletedAt: null },
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { nome: 'asc' }
      }),
      prisma.employee.count({ where: { deletedAt: null } })
    ])
    return { data, total }
  }

  async getEmployeeById(id) {
    const employee = await prisma.employee.findFirst({
      where: { id, deletedAt: null }
    })
    if (!employee) {
      throw new AppError('Funcionário não encontrado', 404, 'EMPLOYEE_NOT_FOUND')
    }
    return employee
  }

  async updateEmployee(id, data) {
    await this.getEmployeeById(id)
    return prisma.employee.update({
      where: { id },
      data
    })
  }

  async deleteEmployee(id) {
    await this.getEmployeeById(id)
    return prisma.employee.update({
      where: { id },
      data: { deletedAt: new Date(), ativo: false }
    })
  }

  async getEmployeeAppointments(id, pagination) {
    await this.getEmployeeById(id)
    const [data, total] = await Promise.all([
      prisma.appointment.findMany({
        where: { employeeId: id, deletedAt: null },
        skip: pagination.skip,
        take: pagination.limit,
        include: { customer: true, pet: true, service: true },
        orderBy: { data: 'desc' }
      }),
      prisma.appointment.count({ where: { employeeId: id, deletedAt: null } })
    ])
    return { data, total }
  }
}