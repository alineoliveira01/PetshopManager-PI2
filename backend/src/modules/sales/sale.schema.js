import { z } from 'zod'

export const createSaleSchema = z.object({
  body: z.object({
    customerId: z.string().uuid('ID do cliente inválido'),
    metodoDePagamento: z.enum(['DINHEIRO', 'PIX', 'CARTAO_DEBITO', 'CARTAO_CREDITO', 'OUTRO']),
    desconto: z.number().min(0).optional(),
    observacoes: z.string().optional(),
    items: z.array(z.object({
      productId: z.string().uuid('ID do produto inválido').optional(),
      serviceId: z.string().uuid('ID do serviço inválido').optional(),
      quantidade: z.number().int().positive('Quantidade deve ser maior que zero'),
      desconto: z.number().min(0).optional()
    })).min(1, 'A venda deve conter pelo menos um item')
  }).refine(data => {
    return data.items.every(item => (item.productId && !item.serviceId) || (!item.productId && item.serviceId))
  }, {
    message: 'Cada item deve ser um produto ou um serviço, não ambos'
  })
})