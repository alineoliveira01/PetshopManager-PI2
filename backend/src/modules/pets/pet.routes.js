import { Router } from 'express'
import { PetController } from './pet.controller.js'
import { PetHistoryService } from '../pet-history/petHistory.service.js'
import { validate } from '../../middlewares/validate.js'
import { createPetSchema, updatePetSchema } from './pet.schema.js'
import { createPetHistorySchema } from '../pet-history/petHistory.schema.js'
import { getPaginationParams, createPaginatedResponse } from '../../utils/pagination.js'

const router = Router()
const controller = new PetController()
const historyService = new PetHistoryService()

router.post('/', validate(createPetSchema), controller.create)
router.get('/', controller.list)
router.get('/:id', controller.getById)
router.put('/:id', validate(updatePetSchema), controller.update)
router.delete('/:id', controller.delete)

router.post('/:id/history', validate(createPetHistorySchema), async (req, res, next) => {
  try {
    const history = await historyService.addHistory(req.params.id, req.body)
    return res.status(201).json({ success: true, data: history })
  } catch (error) {
    next(error)
  }
})

router.get('/:id/history', async (req, res, next) => {
  try {
    const pagination = getPaginationParams(req.query)
    const { data, total } = await historyService.getHistoryByPetId(req.params.id, pagination)
    return res.status(200).json({
      success: true,
      ...createPaginatedResponse(data, total, pagination.page, pagination.limit)
    })
  } catch (error) {
    next(error)
  }
})

export default router