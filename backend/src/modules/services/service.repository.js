import prisma from '../../database/prisma.js'

export class ServiceRepository {
  async create(data) {
    return prisma.service.create({ data })
  }

  async findAll({ skip, limit, where }) {
    const [data, total] = await Promise.all([
      prisma.service.findMany({
        where: { ...where, deletedAt: null },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.service.count({ where: { ...where, deletedAt: null } })
    ])
    return { data, total }
  }

  async findById(id) {
    return prisma.service.findFirst({
      where: { id, deletedAt: null }
    })
  }

  async update(id, data) {
    return prisma.service.update({
      where: { id },
      data
    })
  }

  async softDelete(id) {
    return prisma.service.update({
      where: { id },
      data: { deletedAt: new Date(), ativo: false }
    })
  }
}