import { Router } from 'express'
import { CustomerController } from './customer.controller.js'
import { validate } from '../../middlewares/validate.js'
import { createCustomerSchema, updateCustomerSchema } from './customer.schema.js'

const router = Router()
const controller = new CustomerController()

router.post('/', validate(createCustomerSchema), controller.create)
router.get('/', controller.list)
router.get('/:id', controller.getById)
router.put('/:id', validate(updateCustomerSchema), controller.update)
router.delete('/:id', controller.delete)

export default router