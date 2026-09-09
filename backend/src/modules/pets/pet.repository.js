import prisma from '../../database/prisma.js'

export class PetRepository {
  async create(data) {
    return prisma.pet.create({ data })
  }

  async findAll({ skip, limit, where }) {
    const [data, total] = await Promise.all([
      prisma.pet.findMany({
        where: { ...where, deletedAt: null },
        skip,
        take: limit,
        include: { customer: true },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.pet.count({ where: { ...where, deletedAt: null } })
    ])
    return { data, total }
  }

  async findById(id) {
    return prisma.pet.findFirst({
      where: { id, deletedAt: null },
      include: { customer: true, history: true }
    })
  }

  async update(id, data) {
    return prisma.pet.update({
      where: { id },
      data
    })
  }

  async softDelete(id) {
    return prisma.pet.update({
      where: { id },
      data: { deletedAt: new Date(), ativo: false }
    })
  }
}