import { Router } from 'express'
import { AppointmentController } from './appointment.controller.js'
import { validate } from '../../middlewares/validate.js'
import { createAppointmentSchema, updateAppointmentSchema } from './appointment.schema.js'

const router = Router()
const controller = new AppointmentController()

router.post('/', validate(createAppointmentSchema), controller.create)
router.get('/', controller.list)
router.put('/:id', validate(updateAppointmentSchema), controller.update)
router.delete('/:id', controller.delete)

export default router