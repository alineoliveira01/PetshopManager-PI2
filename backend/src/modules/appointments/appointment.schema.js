import { z } from 'zod'

export const createAppointmentSchema = z.object({
  body: z.object({
    customerId: z.string().uuid('ID do cliente inválido'),
    petId: z.string().uuid('ID do pet inválido'),
    serviceId: z.string().uuid('ID do serviço inválido'),
    employeeId: z.string().uuid('ID do funcionário inválido'),
    data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida (YYYY-MM-DD)'),
    horaInicio: z.string().regex(/^\d{2}:\d{2}$/, 'Hora de início inválida (HH:mm)'),
    observacoes: z.string().optional()
  })
})

export const updateAppointmentSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID inválido')
  }),
  body: z.object({
    status: z.enum(['AGENDADO', 'CONFIRMADO', 'EM_ANDAMENTO', 'CONCLUIDO', 'CANCELADO', 'NAO_COMPARECEU']).optional(),
    observacoes: z.string().optional()
  })
})