import { z } from 'zod'

export const createPetHistorySchema = z.object({
  params: z.object({
    id: z.string().uuid('ID do pet inválido')
  }),
  body: z.object({
    tipo: z.enum(['BANHO', 'TOSA', 'ATENDIMENTO', 'PESAGEM', 'OBSERVACAO', 'OUTRO']),
    descricao: z.string().min(1, 'Descrição é obrigatória'),
    peso: z.number().positive().optional(),
    observacoes: z.string().optional()
  })
})