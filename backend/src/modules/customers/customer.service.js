import { CustomerRepository } from './customer.repository.js'
import { AppError } from '../../errors/AppError.js'
import prisma from '../../database/prisma.js'

const customerRepository = new CustomerRepository()

export class CustomerService {
  async createCustomer(data) {
    const existing = await prisma.customer.findFirst({
      where: {
        OR: [{ cpf: data.cpf }, { email: data.email }],
        deletedAt: null
      }
    })

    if (existing) {
      throw new AppError('Cliente já cadastrado com CPF ou Email informados', 409, 'CUSTOMER_EXISTS')
    }

    return customerRepository.create(data)
  }

  async listCustomers(query, pagination) {
    const { search } = query
    const where = search ? {
      OR: [
        { nomeCompleto: { contains: search, mode: 'insensitive' } },
        { cpf: { contains: search } },
        { telefone: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    } : {}

    return customerRepository.findAll({
      skip: pagination.skip,
      limit: pagination.limit,
      where
    })
  }

  async getCustomerById(id) {
    const customer = await customerRepository.findById(id)
    if (!customer) {
      throw new AppError('Cliente não encontrado', 404, 'CUSTOMER_NOT_FOUND')
    }
    return customer
  }

  async updateCustomer(id, data) {
    await this.getCustomerById(id)
    return customerRepository.update(id, data)
  }

  async deleteCustomer(id) {
    await this.getCustomerById(id)
    return customerRepository.softDelete(id)
  }
}