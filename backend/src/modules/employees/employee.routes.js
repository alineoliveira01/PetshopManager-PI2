import { Router } from 'express'
import { EmployeeController } from './employee.controller.js'
import { validate } from '../../middlewares/validate.js'
import { createEmployeeSchema, updateEmployeeSchema } from './employee.schema.js'

const router = Router()
const controller = new EmployeeController()

router.post('/', validate(createEmployeeSchema), controller.create)
router.get('/', controller.list)
router.get('/:id', controller.getById)
router.put('/:id', validate(updateEmployeeSchema), controller.update)
router.delete('/:id', controller.delete)
router.get('/:id/appointments', controller.getAppointments)

export default router