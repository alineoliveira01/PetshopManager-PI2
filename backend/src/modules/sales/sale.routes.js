import { Router } from 'express'
import { SaleController } from './sale.controller.js'
import { validate } from '../../middlewares/validate.js'
import { createSaleSchema } from './sale.schema.js'

const router = Router()
const controller = new SaleController()

router.post('/', validate(createSaleSchema), controller.create)
router.get('/', controller.list)
router.get('/:id', controller.getById)
router.post('/:id/cancel', controller.cancel)

export default router