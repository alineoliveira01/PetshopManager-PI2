import { Router } from 'express'
import { ServiceController } from './service.controller.js'
import { validate } from '../../middlewares/validate.js'
import { createServiceSchema, updateServiceSchema } from './service.schema.js'

const router = Router()
const controller = new ServiceController()

router.post('/', validate(createServiceSchema), controller.create)
router.get('/', controller.list)
router.get('/:id', controller.getById)
router.put('/:id', validate(updateServiceSchema), controller.update)
router.delete('/:id', controller.delete)

export default router