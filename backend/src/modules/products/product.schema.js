import { z } from 'zod'

export const createProductSchema = z.object({
  body: z.object({
    categoryId: z.string().uuid('ID da categoria inválido'),
    nome: z.string().min(1, 'Nome do produto é obrigatório'),
    descricao: z.string().optional(),
    SKU: z.string().min(1, 'SKU é obrigatório'),
    precoAtual: z.number().min(0, 'Preço não pode ser negativo'),
    estoqueAtual: z.number().int().min(0).default(0),
    estoqueMinimo: z.number().int().min(0).default(5)
  })
})

export const updateProductSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID inválido')
  }),
  body: createProductSchema.shape.body.partial().extend({
    motivoAlteracaoPreco: z.string().optional()
  })
})

export const stockMovementSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID inválido')
  }),
  body: z.object({
    tipo: z.enum(['ENTRADA', 'SAIDA', 'AJUSTE']),
    quantidade: z.number().int().min(0, 'Quantidade deve ser maior ou igual a zero'),
    motivo: z.string().min(1, 'Motivo é obrigatório'),
    referencia: z.string().optional()
  })
})