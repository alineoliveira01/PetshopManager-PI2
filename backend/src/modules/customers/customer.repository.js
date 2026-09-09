import prisma from '../../database/prisma.js'

export class CustomerRepository {
  async create(data) {
    return prisma.customer.create({ data })
  }

  async findAll({ skip, limit, where }) {
    const [data, total] = await Promise.all([
      prisma.customer.findMany({
        where: { ...where, deletedAt: null },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.customer.count({ where: { ...where, deletedAt: null } })
    ])
    return { data, total }
  }

  async findById(id) {
    return prisma.customer.findFirst({
      where: { id, deletedAt: null }
    })
  }

  async update(id, data) {
    return prisma.customer.update({
      where: { id },
      data
    })
  }

  async softDelete(id) {
    return prisma.customer.update({
      where: { id },
      data: { deletedAt: new Date(), ativo: false }
    })
  }
}