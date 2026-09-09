import { z } from 'zod'

export const createCustomerSchema = z.object({
  body: z.object({
    nomeCompleto: z.string().min(3, 'Nome completo é obrigatório'),
    cpf: z.string().length(11, 'CPF deve conter 11 dígitos'),
    telefone: z.string().min(8, 'Telefone inválido'),
    email: z.string().email('E-mail inválido'),
    endereco: z.string().min(1, 'Endereço é obrigatório'),
    numero: z.string().min(1, 'Número é obrigatório'),
    complemento: z.string().optional(),
    bairro: z.string().min(1, 'Bairro é obrigatório'),
    cidade: z.string().min(1, 'Cidade é obrigatória'),
    estado: z.string().length(2, 'Estado deve ter 2 caracteres'),
    cep: z.string().length(8, 'CEP deve conter 8 dígitos'),
    observacoes: z.string().optional()
  })
})

export const updateCustomerSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID inválido')
  }),
  body: createCustomerSchema.shape.body.partial()
})