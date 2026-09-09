import prisma from '../../database/prisma.js'

export class CategoryRepository {
  async create(data) {
    return prisma.category.create({ data })
  }

  async findAll({ skip, limit, where }) {
    const [data, total] = await Promise.all([
      prisma.category.findMany({
        where: { ...where, deletedAt: null },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.category.count({ where: { ...where, deletedAt: null } })
    ])
    return { data, total }
  }

  async findById(id) {
    return prisma.category.findFirst({
      where: { id, deletedAt: null }
    })
  }

  async update(id, data) {
    return prisma.category.update({
      where: { id },
      data
    })
  }

  async softDelete(id) {
    return prisma.category.update({
      where: { id },
      data: { deletedAt: new Date(), ativo: false }
    })
  }
}