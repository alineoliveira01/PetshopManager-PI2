import prisma from '../../config/database.js'
import { AppError } from '../../errors/AppError.js'

export class StockService {
  async addMovement(productId, data) {
    const product = await prisma.product.findFirst({
      where: { id: productId, deletedAt: null }
    })
    
    if (!product) {
      throw new AppError('Produto não encontrado', 404, 'PRODUCT_NOT_FOUND')
    }

    return prisma.$transaction(async (tx) => {
      const estoqueAnterior = product.estoqueAtual
      let estoquePosterior = estoqueAnterior

      if (data.tipo === 'ENTRADA') {
        estoquePosterior += data.quantidade
      } else if (data.tipo === 'SAIDA') {
        if (estoqueAnterior < data.quantidade) {
          throw new AppError('Estoque insuficiente', 400, 'INSUFFICIENT_STOCK')
        }
        estoquePosterior -= data.quantidade
      } else if (data.tipo === 'AJUSTE') {
        estoquePosterior = data.quantidade
      }

      await tx.product.update({
        where: { id: productId },
        data: { estoqueAtual: estoquePosterior }
      })

      return tx.stockMovement.create({
        data: {
          productId,
          tipo: data.tipo,
          quantidade: data.tipo === 'AJUSTE' ? Math.abs(estoquePosterior - estoqueAnterior) : data.quantidade,
          estoqueAnterior,
          estoquePosterior,
          motivo: data.motivo,
          referencia: data.referencia
        }
      })
    })
  }

  async listMovements(query, pagination) {
    const { tipo, productId } = query
    const where = {}

    if (tipo) where.tipo = tipo
    if (productId) where.productId = productId

    const [data, total] = await Promise.all([
      prisma.stockMovement.findMany({
        where,
        skip: pagination.skip,
        take: pagination.limit,
        include: { product: true },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.stockMovement.count({ where })
    ])
    
    return { data, total }
  }
}