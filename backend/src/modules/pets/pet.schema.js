import { z } from 'zod'

export const createPetSchema = z.object({
  body: z.object({
    customerId: z.string().uuid('ID do cliente inválido'),
    nome: z.string().min(1, 'Nome do pet é obrigatório'),
    especie: z.string().min(1, 'Espécie é obrigatória'),
    raca: z.string().min(1, 'Raça é obrigatória'),
    sexo: z.string().min(1, 'Sexo é obrigatório'),
    pesoAtual: z.number().positive('Peso deve ser positivo'),
    tamanho: z.enum(['PEQUENO', 'MEDIO', 'GRANDE']),
    tamanhoDoPelo: z.enum(['CURTO', 'MEDIO', 'LONGO']),
    idade: z.number().int().nonnegative('Idade inválida'),
    tranquilidade: z.enum(['TRANQUILO', 'MODERADO', 'AGITADO']),
    observacoes: z.string().optional()
  })
})

export const updatePetSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID inválido')
  }),
  body: createPetSchema.shape.body.partial()
})