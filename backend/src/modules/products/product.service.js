import prisma from '../../database/prisma.js'
import { AppError } from '../../errors/AppError.js'

export class ProductService {
  async createProduct(data) {
    const category = await prisma.category.findFirst({
      where: { id: data.categoryId, deletedAt: null, ativo: true }
    })
    
    if (!category) {
      throw new AppError('Categoria inválida ou inativa', 400, 'INVALID_CATEGORY')
    }
    
    const existingSku = await prisma.product.findFirst({
      where: { SKU: data.SKU }
    })
    
    if (existingSku) {
      throw new AppError('SKU já cadastrado', 409, 'SKU_EXISTS')
    }
    
    return prisma.$transaction(async (tx) => {
      const product = await tx.product.create({ data })
      
      if (Number(data.precoAtual) > 0) {
        await tx.productPriceHistory.create({
          data: {
            productId: product.id,
            price: data.precoAtual,
            previousPrice: 0,
            reason: 'Preço inicial de cadastro'
          }
        })
      }
      
      if (data.estoqueAtual > 0) {
        await tx.stockMovement.create({
          data: {
            productId: product.id,
            tipo: 'ENTRADA',
            quantidade: data.estoqueAtual,
            estoqueAnterior: 0,
            estoquePosterior: data.estoqueAtual,
            motivo: 'Estoque inicial'
          }
        })
      }
      
      return product
    })
  }

  async updateProduct(id, data) {
    const product = await prisma.product.findFirst({
      where: { id, deletedAt: null }
    })
    
    if (!product) {
      throw new AppError('Produto não encontrado', 404, 'PRODUCT_NOT_FOUND')
    }
    
    return prisma.$transaction(async (tx) => {
      if (data.precoAtual && Number(data.precoAtual) !== Number(product.precoAtual)) {
        await tx.productPriceHistory.create({
          data: {
            productId: id,
            price: data.precoAtual,
            previousPrice: product.precoAtual,
            reason: data.motivoAlteracaoPreco || 'Atualização de preço'
          }
        })
      }
      
      return tx.product.update({
        where: { id },
        data
      })
    })
  }

  async listProducts(query, pagination) {
    const { search, categoryId, ativo, estoqueBaixo } = query
    const where = { deletedAt: null }
    
    if (categoryId) where.categoryId = categoryId
    if (ativo !== undefined) where.ativo = ativo === 'true'
    
    if (search) {
      where.OR = [
        { nome: { contains: search, mode: 'insensitive' } },
        { SKU: { contains: search } }
      ]
    }
    
    if (estoqueBaixo === 'true') {
      where.estoqueAtual = { lte: prisma.product.fields.estoqueMinimo }
    }
    
    const [data, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip: pagination.skip,
        take: pagination.limit,
        include: { category: true },
        orderBy: { nome: 'asc' }
      }),
      prisma.product.count({ where })
    ])
    
    return { data, total }
  }

  async getProductById(id) {
    const product = await prisma.product.findFirst({
      where: { id, deletedAt: null },
      include: { category: true }
    })
    
    if (!product) {
      throw new AppError('Produto não encontrado', 404, 'PRODUCT_NOT_FOUND')
    }
    
    return product
  }

  async deleteProduct(id) {
    await this.getProductById(id)
    return prisma.product.update({
      where: { id },
      data: { deletedAt: new Date(), ativo: false }
    })
  }

  async getPriceHistory(id, pagination) {
    await this.getProductById(id)
    
    const [data, total] = await Promise.all([
      prisma.productPriceHistory.findMany({
        where: { productId: id },
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { changedAt: 'desc' }
      }),
      prisma.productPriceHistory.count({ where: { productId: id } })
    ])
    
    return { data, total }
  }

  async getStockHistory(id, pagination) {
    await this.getProductById(id)
    
    const [data, total] = await Promise.all([
      prisma.stockMovement.findMany({
        where: { productId: id },
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.stockMovement.count({ where: { productId: id } })
    ])
    
    return { data, total }
  }

  async addStockMovement(id, data) {
    const product = await this.getProductById(id)
    
    return prisma.$transaction(async (tx) => {
      const estoqueAnterior = product.estoqueAtual
      let estoquePosterior = estoqueAnterior
      
      if (data.tipo === 'ENTRADA') {
        estoquePosterior += data.quantidade
      } else if (data.tipo === 'SAIDA') {
        if (estoqueAnterior < data.quantidade) {
          throw new AppError('Estoque insuficiente para a saída solicitada', 400, 'INSUFFICIENT_STOCK')
        }
        estoquePosterior -= data.quantidade
      } else if (data.tipo === 'AJUSTE') {
        estoquePosterior = data.quantidade
      }
      
      await tx.product.update({
        where: { id },
        data: { estoqueAtual: estoquePosterior }
      })
      
      return tx.stockMovement.create({
        data: {
          productId: id,
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
}