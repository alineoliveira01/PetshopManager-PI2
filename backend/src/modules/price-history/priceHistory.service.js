import prisma from '../../config/database.js'
import { AppError } from '../../errors/AppError.js'

export class PriceHistoryService {
  async listAllHistory(query, pagination) {
    const { productId } = query
    const where = {}

    if (productId) where.productId = productId

    const [data, total] = await Promise.all([
      prisma.productPriceHistory.findMany({
        where,
        skip: pagination.skip,
        take: pagination.limit,
        include: { product: true },
        orderBy: { changedAt: 'desc' }
      }),
      prisma.productPriceHistory.count({ where })
    ])

    return { data, total }
  }

  async getHistoryByProductId(productId, pagination) {
    const product = await prisma.product.findFirst({
      where: { id: productId, deletedAt: null }
    })
    
    if (!product) {
      throw new AppError('Produto não encontrado', 404, 'PRODUCT_NOT_FOUND')
    }

    const [data, total] = await Promise.all([
      prisma.productPriceHistory.findMany({
        where: { productId },
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { changedAt: 'desc' }
      }),
      prisma.productPriceHistory.count({ where: { productId } })
    ])

    return { data, total }
  }
}