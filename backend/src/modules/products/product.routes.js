import { Router } from 'express'
import { ProductController } from './product.controller.js'
import { validate } from '../../middlewares/validate.js'
import { createProductSchema, updateProductSchema, stockMovementSchema } from './product.schema.js'

const router = Router()
const controller = new ProductController()

router.post('/', validate(createProductSchema), controller.create)
router.get('/', controller.list)
router.get('/:id', controller.getById)
router.put('/:id', validate(updateProductSchema), controller.update)
router.delete('/:id', controller.delete)
router.get('/:id/price-history', controller.getPriceHistory)
router.get('/:id/stock', controller.getStockHistory)
router.post('/:id/stock', validate(stockMovementSchema), controller.addStockMovement)

export default router