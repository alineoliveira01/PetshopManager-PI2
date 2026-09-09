import { Router } from 'express'
import { StockController } from './stock.controller.js'
import { validate } from '../../middlewares/validate.js'
import { createStockMovementSchema } from './stock.schema.js'

const router = Router()
const controller = new StockController()

router.get('/movements', controller.list)
router.post('/products/:productId/movement', validate(createStockMovementSchema), controller.create)

export default router