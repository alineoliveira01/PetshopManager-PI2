import test, { mock } from 'node:test'
import assert from 'node:assert'
import { ProductService } from '../src/modules/products/product.service.js'
import prisma from '../src/database/prisma.js'

function mockPrisma(model, methods) {
  Object.defineProperty(prisma, model, {
    value: methods,
    configurable: true
  })
}

test('Product Service', async (t) => {
  const productService = new ProductService()

  t.afterEach(() => {
    mock.restoreAll()
  })

  await t.test('Deve criar produto e registrar historico de preco e estoque inicial', async () => {
    mockPrisma('category', { findFirst: async () => ({ id: 'category-1', ativo: true }) })
    mockPrisma('product', { findFirst: async () => null })
    
    mock.method(prisma, '$transaction', async (callback) => {
      return callback({
        product: { create: async (data) => ({ id: 'product-1', ...data.data }) },
        productPriceHistory: { create: async () => ({}) },
        stockMovement: { create: async () => ({}) }
      })
    })

    const productData = {
      categoryId: 'category-1',
      nome: 'Racao Dog Premium',
      SKU: 'DOG-123',
      precoAtual: 120.00,
      estoqueAtual: 10
    }

    const result = await productService.createProduct(productData)

    assert.strictEqual(result.id, 'product-1')
    assert.strictEqual(result.SKU, 'DOG-123')
  })

  await t.test('Deve rejeitar criacao de produto com SKU duplicado', async () => {
    mockPrisma('category', { findFirst: async () => ({ id: 'category-1', ativo: true }) })
    mockPrisma('product', { findFirst: async () => ({ id: 'existing-product' }) })

    const productData = {
      categoryId: 'category-1',
      nome: 'Racao Cat Premium',
      SKU: 'CAT-123',
      precoAtual: 100
    }

    await assert.rejects(
      async () => {
        await productService.createProduct(productData)
      },
      (error) => {
        assert.strictEqual(error.code, 'SKU_EXISTS')
        return true
      }
    )
  })

  await t.test('Deve listar produtos', async () => {
    mockPrisma('product', {
      findMany: async () => [{ id: 'product-1', nome: 'Racao' }],
      count: async () => 1,
      fields: { estoqueMinimo: 5 }
    })

    const result = await productService.listProducts({}, { skip: 0, limit: 10 })

    assert.strictEqual(result.data.length, 1)
    assert.strictEqual(result.total, 1)
  })

  await t.test('Deve deletar (soft delete) produto', async () => {
    mockPrisma('product', {
      findFirst: async () => ({ id: 'product-1' }),
      update: async (data) => ({ ...data.data })
    })

    const result = await productService.deleteProduct('product-1')

    assert.strictEqual(result.ativo, false)
  })

  await t.test('Deve registrar movimentacao de entrada no estoque com sucesso', async () => {
    mockPrisma('product', { findFirst: async () => ({ id: 'product-1', estoqueAtual: 10, deletedAt: null, category: {} }) })
    
    mock.method(prisma, '$transaction', async (callback) => {
      return callback({
        product: { update: async () => ({}) },
        stockMovement: { create: async (data) => ({ ...data.data }) }
      })
    })

    const movementData = {
      tipo: 'ENTRADA',
      quantidade: 5,
      motivo: 'Compra de fornecedor'
    }

    const result = await productService.addStockMovement('product-1', movementData)

    assert.strictEqual(result.tipo, 'ENTRADA')
    assert.strictEqual(result.estoqueAnterior, 10)
    assert.strictEqual(result.estoquePosterior, 15)
  })

  await t.test('Deve rejeitar movimentacao de saida com estoque insuficiente', async () => {
    mockPrisma('product', { findFirst: async () => ({ id: 'product-1', estoqueAtual: 2, deletedAt: null, category: {} }) })
    
    mock.method(prisma, '$transaction', async (callback) => {
      return callback({}) 
    })

    const movementData = {
      tipo: 'SAIDA',
      quantidade: 5,
      motivo: 'Venda externa avulsa'
    }

    await assert.rejects(
      async () => {
        await productService.addStockMovement('product-1', movementData)
      },
      (error) => {
        assert.strictEqual(error.code, 'INSUFFICIENT_STOCK')
        return true
      }
    )
  })
})