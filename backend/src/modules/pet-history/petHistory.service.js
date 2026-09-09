import prisma from '../../database/prisma.js'
import { AppError } from '../../errors/AppError.js'

export class PetHistoryService {
  async addHistory(petId, data) {
    const pet = await prisma.pet.findFirst({
      where: { id: petId, deletedAt: null }
    })
    if (!pet) {
      throw new AppError('Pet não encontrado', 404, 'PET_NOT_FOUND')
    }

    return prisma.$transaction(async (tx) => {
      const history = await tx.petHistory.create({
        data: {
          petId,
          ...data
        }
      })

      if (data.peso && data.peso !== pet.pesoAtual) {
        await tx.pet.update({
          where: { id: petId },
          data: { pesoAtual: data.peso }
        })
      }

      return history
    })
  }

  async getHistoryByPetId(petId, pagination) {
    const pet = await prisma.pet.findFirst({
      where: { id: petId, deletedAt: null }
    })
    if (!pet) {
      throw new AppError('Pet não encontrado', 404, 'PET_NOT_FOUND')
    }

    const [data, total] = await Promise.all([
      prisma.petHistory.findMany({
        where: { petId },
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.petHistory.count({ where: { petId } })
    ])
    return { data, total }
  }
}