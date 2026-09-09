import prisma from '../../database/prisma.js'
import { AppError } from '../../errors/AppError.js'

export class SaleService {
  async createSale(data) {
    const { customerId, items, metodoDePagamento, desconto = 0, observacoes } = data
    
    return prisma.$transaction(async (tx) => {
      const customer = await tx.customer.findFirst({
        where: { id: customerId, deletedAt: null, ativo: true }
      })
      
      if (!customer) {
        throw new AppError('Cliente inválido ou inativo', 400, 'INVALID_CUSTOMER')
      }
      
      let subtotal = 0
      const processedItems = []
      
      for (const item of items) {
        if (item.productId) {
          const product = await tx.product.findFirst({
            where: { id: item.productId, deletedAt: null, ativo: true }
          })
          
          if (!product) {
            throw new AppError(`Produto não encontrado ou inativo`, 400, 'PRODUCT_NOT_FOUND')
          }
          
          if (product.estoqueAtual < item.quantidade) {
            throw new AppError(`Estoque insuficiente para o produto ${product.nome}`, 400, 'INSUFFICIENT_STOCK')
          }
          
          const itemSubtotal = Number(product.precoAtual) * item.quantidade - (item.desconto || 0)
          subtotal += itemSubtotal
          
          processedItems.push({
            productId: product.id,
            nome: product.nome,
            quantidade: item.quantidade,
            precoUnitario: product.precoAtual,
            desconto: item.desconto || 0,
            subtotal: itemSubtotal
          })
          
          const estoqueAnterior = product.estoqueAtual
          const estoquePosterior = estoqueAnterior - item.quantidade
          
          await tx.product.update({
            where: { id: product.id },
            data: { estoqueAtual: estoquePosterior }
          })
          
          await tx.stockMovement.create({
            data: {
              productId: product.id,
              tipo: 'SAIDA',
              quantidade: item.quantidade,
              estoqueAnterior,
              estoquePosterior,
              motivo: 'Venda realizada',
              referencia: customerId
            }
          })
        } else if (item.serviceId) {
          const service = await tx.service.findFirst({
            where: { id: item.serviceId, deletedAt: null, ativo: true }
          })
          
          if (!service) {
            throw new AppError(`Serviço não encontrado ou inativo`, 400, 'SERVICE_NOT_FOUND')
          }
          
          const itemSubtotal = Number(service.precoAtual) * item.quantidade - (item.desconto || 0)
          subtotal += itemSubtotal
          
          processedItems.push({
            serviceId: service.id,
            nome: service.nome,
            quantidade: item.quantidade,
            precoUnitario: service.precoAtual,
            desconto: item.desconto || 0,
            subtotal: itemSubtotal
          })
        } else {
          throw new AppError('Cada item deve conter um produto ou um serviço', 400, 'INVALID_SALE_ITEM')
        }
      }
      
      const total = Math.max(0, subtotal - desconto)
      
      const sale = await tx.sale.create({
        data: {
          customerId,
          subtotal,
          desconto,
          total,
          metodoDePagamento,
          status: 'PAGA',
          observacoes,
          items: {
            create: processedItems
          }
        },
        include: { items: true }
      })
      
      return sale
    })
  }

  async cancelSale(id) {
    return prisma.$transaction(async (tx) => {
      const sale = await tx.sale.findUnique({
        where: { id },
        include: { items: true }
      })
      
      if (!sale) {
        throw new AppError('Venda não encontrada', 404, 'SALE_NOT_FOUND')
      }
      
      if (sale.status === 'CANCELADA') {
        throw new AppError('Esta venda já está cancelada', 400, 'SALE_ALREADY_CANCELED')
      }
      
      for (const item of sale.items) {
        if (item.productId) {
          const product = await tx.product.findUnique({
            where: { id: item.productId }
          })
          
          if (product) {
            const estoqueAnterior = product.estoqueAtual
            const estoquePosterior = estoqueAnterior + item.quantidade
            
            await tx.product.update({
              where: { id: product.id },
              data: { estoqueAtual: estoquePosterior }
            })
            
            await tx.stockMovement.create({
              data: {
                productId: product.id,
                tipo: 'ENTRADA',
                quantidade: item.quantidade,
                estoqueAnterior,
                estoquePosterior,
                motivo: 'Cancelamento de venda',
                referencia: sale.id
              }
            })
          }
        }
      }
      
      return tx.sale.update({
        where: { id },
        data: { status: 'CANCELADA' }
      })
    })
  }

  async listSales(pagination) {
    const [data, total] = await Promise.all([
      prisma.sale.findMany({
        skip: pagination.skip,
        take: pagination.limit,
        include: { customer: true, items: true },
        orderBy: { dataDaVenda: 'desc' }
      }),
      prisma.sale.count()
    ])
    
    return { data, total }
  }

  async getSaleById(id) {
    const sale = await prisma.sale.findUnique({
      where: { id },
      include: { customer: true, items: true }
    })
    
    if (!sale) {
      throw new AppError('Venda não encontrada', 404, 'SALE_NOT_FOUND')
    }
    
    return sale
  }
}