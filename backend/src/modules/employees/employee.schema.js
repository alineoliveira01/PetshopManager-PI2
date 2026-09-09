import { z } from 'zod'

export const createEmployeeSchema = z.object({
  body: z.object({
    nome: z.string().min(3, 'Nome é obrigatório'),
    telefone: z.string().min(8, 'Telefone inválido'),
    email: z.string().email('E-mail inválido'),
    cargo: z.string().min(2, 'Cargo é obrigatório')
  })
})

export const updateEmployeeSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID inválido')
  }),
  body: createEmployeeSchema.shape.body.partial()
})