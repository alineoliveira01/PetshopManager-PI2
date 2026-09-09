import { Router } from 'express'
import { PriceHistoryController } from './priceHistory.controller.js'

const router = Router()
const controller = new PriceHistoryController()

router.get('/', controller.listAll)
router.get('/products/:productId', controller.listByProduct)

export default router