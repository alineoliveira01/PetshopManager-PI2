import { z } from 'zod'

export const createCategorySchema = z.object({
  body: z.object({
    nome: z.string().min(1, 'Nome da categoria é obrigatório'),
    descricao: z.string().optional()
  })
})

export const updateCategorySchema = z.object({
  params: z.object({
    id: z.string().uuid('ID inválido')
  }),
  body: createCategorySchema.shape.body.partial()
})