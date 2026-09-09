import { z } from 'zod'

export const createServiceSchema = z.object({
  body: z.object({
    nome: z.string().min(1, 'Nome do serviço é obrigatório'),
    descricao: z.string().optional(),
    precoAtual: z.number().positive('Preço deve ser positivo'),
    duracaoEmMinutos: z.number().int().positive('Duração deve ser em minutos positivos')
  })
})

export const updateServiceSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID inválido')
  }),
  body: createServiceSchema.shape.body.partial()
})