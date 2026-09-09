import { Router } from 'express'
import { CategoryController } from './category.controller.js'
import { validate } from '../../middlewares/validate.js'
import { createCategorySchema, updateCategorySchema } from './category.schema.js'

const router = Router()
const controller = new CategoryController()

router.post('/', validate(createCategorySchema), controller.create)
router.get('/', controller.list)
router.get('/:id', controller.getById)
router.put('/:id', validate(updateCategorySchema), controller.update)
router.delete('/:id', controller.delete)

export default router