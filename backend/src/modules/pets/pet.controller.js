import { PetService } from './pet.service.js'
import { getPaginationParams, createPaginatedResponse } from '../../utils/pagination.js'

const petService = new PetService()

export class PetController {
  async create(req, res, next) {
    try {
      const pet = await petService.createPet(req.body)
      return res.status(201).json({ success: true, data: pet })
    } catch (error) {
      next(error)
    }
  }

  async list(req, res, next) {
    try {
      const pagination = getPaginationParams(req.query)
      const { data, total } = await petService.listPets(req.query, pagination)
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
      const pet = await petService.getPetById(req.params.id)
      return res.status(200).json({ success: true, data: pet })
    } catch (error) {
      next(error)
    }
  }

  async update(req, res, next) {
    try {
      const pet = await petService.updatePet(req.params.id, req.body)
      return res.status(200).json({ success: true, data: pet })
    } catch (error) {
      next(error)
    }
  }

  async delete(req, res, next) {
    try {
      await petService.deletePet(req.params.id)
      return res.status(204).send()
    } catch (error) {
      next(error)
    }
  }
}