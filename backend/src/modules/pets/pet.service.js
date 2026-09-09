import { PetRepository } from './pet.repository.js'
import { AppError } from '../../errors/AppError.js'
import prisma from '../../database/prisma.js'

const petRepository = new PetRepository()

export class PetService {
  async createPet(data) {
    const customer = await prisma.customer.findFirst({
      where: { id: data.customerId, deletedAt: null, ativo: true }
    })
    if (!customer) {
      throw new AppError('Cliente não encontrado ou inativo', 400, 'CUSTOMER_NOT_FOUND')
    }
    return petRepository.create(data)
  }

  async listPets(query, pagination) {
    const { search, customerId } = query
    const where = {}
    if (customerId) where.customerId = customerId
    if (search) {
      where.OR = [
        { nome: { contains: search, mode: 'insensitive' } },
        { especie: { contains: search, mode: 'insensitive' } },
        { raca: { contains: search, mode: 'insensitive' } }
      ]
    }
    return petRepository.findAll({
      skip: pagination.skip,
      limit: pagination.limit,
      where
    })
  }

  async getPetById(id) {
    const pet = await petRepository.findById(id)
    if (!pet) {
      throw new AppError('Pet não encontrado', 404, 'PET_NOT_FOUND')
    }
    return pet
  }

  async updatePet(id, data) {
    await this.getPetById(id)
    if (data.customerId) {
      const customer = await prisma.customer.findFirst({
        where: { id: data.customerId, deletedAt: null, ativo: true }
      })
      if (!customer) {
        throw new AppError('Novo cliente não encontrado ou inativo', 400, 'CUSTOMER_NOT_FOUND')
      }
    }
    return petRepository.update(id, data)
  }

  async deletePet(id) {
    await this.getPetById(id)
    return petRepository.softDelete(id)
  }
}