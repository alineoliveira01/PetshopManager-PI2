import { z } from 'zod'

export const createStockMovementSchema = z.object({
  params: z.object({
    productId: z.string().uuid()
  }),
  body: z.object({
    tipo: z.enum(['ENTRADA', 'SAIDA', 'AJUSTE']),
    quantidade: z.number().int().min(0),
    motivo: z.string().min(1),
    referencia: z.string().optional()
  })
})