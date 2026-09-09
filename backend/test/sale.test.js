import test, { mock } from 'node:test'
import assert from 'node:assert'
import { SaleService } from '../src/modules/sales/sale.service.js'
import prisma from '../src/database/prisma.js'

function mockPrisma(model, methods) {
  Object.defineProperty(prisma, model, {
    value: methods,
    configurable: true
  })
}

test('Sale Service', async (t) => {
  const saleService = new SaleService()

  t.afterEach(() => {
    mock.restoreAll()
  })

  await t.test('Deve criar uma venda de produto com sucesso e calcular totais', async () => {
    mock.method(prisma, '$transaction', async (callback) => {
      return callback({
        customer: { findFirst: async () => ({ id: 'customer-1', ativo: true }) },
        product: { 
          findFirst: async () => ({ id: 'product-1', nome: 'Racao', precoAtual: 50.0, estoqueAtual: 10, ativo: true }),
          update: async () => ({})
        },
        stockMovement: { create: async () => ({}) },
        sale: { create: async (data) => ({ id: 'sale-1', ...data.data }) }
      })
    })

    const saleData = {
      customerId: 'customer-1',
      metodoDePagamento: 'PIX',
      items: [
        { productId: 'product-1', quantidade: 2, desconto: 0 }
      ]
    }

    const result = await saleService.createSale(saleData)

    assert.strictEqual(result.id, 'sale-1')
    assert.strictEqual(result.subtotal, 100)
    assert.strictEqual(result.total, 100)
    assert.strictEqual(result.status, 'PAGA')
  })

  await t.test('Deve criar uma venda de servico com sucesso aplicando descontos', async () => {
    mock.method(prisma, '$transaction', async (callback) => {
      return callback({
        customer: { findFirst: async () => ({ id: 'customer-1', ativo: true }) },
        service: { findFirst: async () => ({ id: 'service-1', nome: 'Banho', precoAtual: 80.0, ativo: true }) },
        sale: { create: async (data) => ({ id: 'sale-2', ...data.data }) }
      })
    })

    const saleData = {
      customerId: 'customer-1',
      metodoDePagamento: 'CARTAO_CREDITO',
      items: [
        { serviceId: 'service-1', quantidade: 1, desconto: 10 }
      ]
    }

    const result = await saleService.createSale(saleData)

    assert.strictEqual(result.subtotal, 70)
    assert.strictEqual(result.total, 70)
  })

  await t.test('Deve rejeitar venda para cliente invalido ou inativo', async () => {
    mock.method(prisma, '$transaction', async (callback) => {
      return callback({
        customer: { findFirst: async () => null }
      })
    })

    const saleData = {
      customerId: 'invalid-customer',
      metodoDePagamento: 'PIX',
      items: [
        { productId: 'product-1', quantidade: 1 }
      ]
    }

    await assert.rejects(
      async () => {
        await saleService.createSale(saleData)
      },
      (error) => {
        assert.strictEqual(error.code, 'INVALID_CUSTOMER')
        return true
      }
    )
  })

  await t.test('Deve rejeitar venda de produto sem estoque suficiente', async () => {
    mock.method(prisma, '$transaction', async (callback) => {
      return callback({
        customer: { findFirst: async () => ({ id: 'customer-1', ativo: true }) },
        product: { findFirst: async () => ({ id: 'product-1', nome: 'Racao', precoAtual: 50.0, estoqueAtual: 0, ativo: true }) }
      })
    })

    const saleData = {
      customerId: 'customer-1',
      metodoDePagamento: 'PIX',
      items: [
        { productId: 'product-1', quantidade: 2 }
      ]
    }

    await assert.rejects(
      async () => {
        await saleService.createSale(saleData)
      },
      (error) => {
        assert.strictEqual(error.code, 'INSUFFICIENT_STOCK')
        return true
      }
    )
  })

  await t.test('Deve cancelar venda com sucesso e estornar o estoque', async () => {
    mock.method(prisma, '$transaction', async (callback) => {
      return callback({
        sale: { 
          findUnique: async () => ({ 
            id: 'sale-1', 
            status: 'PAGA',
            items: [{ productId: 'product-1', quantidade: 2 }]
          }),
          update: async (data) => ({ ...data.data })
        },
        product: { 
          findUnique: async () => ({ id: 'product-1', estoqueAtual: 8 }),
          update: async () => ({})
        },
        stockMovement: { create: async () => ({}) }
      })
    })

    const result = await saleService.cancelSale('sale-1')

    assert.strictEqual(result.status, 'CANCELADA')
  })

  await t.test('Deve rejeitar cancelamento de venda ja cancelada', async () => {
    mock.method(prisma, '$transaction', async (callback) => {
      return callback({
        sale: { 
          findUnique: async () => ({ 
            id: 'sale-1', 
            status: 'CANCELADA',
            items: []
          })
        }
      })
    })

    await assert.rejects(
      async () => {
        await saleService.cancelSale('sale-1')
      },
      (error) => {
        assert.strictEqual(error.code, 'SALE_ALREADY_CANCELED')
        return true
      }
    )
  })

  await t.test('Deve listar vendas', async () => {
    mockPrisma('sale', {
      findMany: async () => [{ id: 'sale-1', total: 100 }],
      count: async () => 1
    })

    const result = await saleService.listSales({ skip: 0, limit: 10 })

    assert.strictEqual(result.data.length, 1)
    assert.strictEqual(result.total, 1)
  })

  await t.test('Deve buscar venda por id', async () => {
    mockPrisma('sale', {
      findUnique: async () => ({ id: 'sale-1', total: 100 })
    })

    const result = await saleService.getSaleById('sale-1')

    assert.strictEqual(result.id, 'sale-1')
  })
})