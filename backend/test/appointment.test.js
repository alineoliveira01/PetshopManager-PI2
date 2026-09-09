import test from 'node:test'
import assert from 'node:assert'
import { AppointmentService } from '../src/modules/appointments/appointment.service.js'
import prisma from '../src/database/prisma.js'

function mockPrisma(model, methods) {
  Object.defineProperty(prisma, model, {
    value: methods,
    configurable: true
  })
}

test('Appointment Service', async (t) => {
  const appointmentService = new AppointmentService()

  await t.test('Deve criar um agendamento com sucesso', async () => {
    mockPrisma('customer', { findFirst: async () => ({ id: 'customer-1', ativo: true }) })
    mockPrisma('pet', { findFirst: async () => ({ id: 'pet-1', customerId: 'customer-1', ativo: true }) })
    mockPrisma('service', { findFirst: async () => ({ id: 'service-1', duracaoEmMinutos: 60, ativo: true }) })
    mockPrisma('employee', { findFirst: async () => ({ id: 'employee-1', ativo: true }) })
    mockPrisma('appointment', {
      findMany: async () => [],
      create: async (data) => ({ id: 'appointment-1', ...data.data })
    })

    const appointmentData = {
      customerId: 'customer-1',
      petId: 'pet-1',
      serviceId: 'service-1',
      employeeId: 'employee-1',
      data: '2026-10-10',
      horaInicio: '10:00'
    }

    const result = await appointmentService.createAppointment(appointmentData)

    assert.strictEqual(result.id, 'appointment-1')
    assert.strictEqual(result.status, 'AGENDADO')
    assert.strictEqual(result.horaFim, '11:00')
  })

  await t.test('Deve rejeitar agendamento sem cliente valido', async () => {
    mockPrisma('customer', { findFirst: async () => null })

    const appointmentData = {
      customerId: 'invalid-customer',
      petId: 'pet-1',
      serviceId: 'service-1',
      employeeId: 'employee-1',
      data: '2026-10-10',
      horaInicio: '10:00'
    }

    await assert.rejects(
      async () => {
        await appointmentService.createAppointment(appointmentData)
      },
      (error) => {
        assert.strictEqual(error.code, 'CUSTOMER_NOT_FOUND')
        return true
      }
    )
  })

  await t.test('Deve rejeitar agendamento sem pet valido', async () => {
    mockPrisma('customer', { findFirst: async () => ({ id: 'customer-1', ativo: true }) })
    mockPrisma('pet', { findFirst: async () => null })

    const appointmentData = {
      customerId: 'customer-1',
      petId: 'invalid-pet',
      serviceId: 'service-1',
      employeeId: 'employee-1',
      data: '2026-10-10',
      horaInicio: '10:00'
    }

    await assert.rejects(
      async () => {
        await appointmentService.createAppointment(appointmentData)
      },
      (error) => {
        assert.strictEqual(error.code, 'INVALID_PET')
        return true
      }
    )
  })

  await t.test('Deve rejeitar agendamento sem servico valido', async () => {
    mockPrisma('customer', { findFirst: async () => ({ id: 'customer-1', ativo: true }) })
    mockPrisma('pet', { findFirst: async () => ({ id: 'pet-1', customerId: 'customer-1', ativo: true }) })
    mockPrisma('service', { findFirst: async () => null })

    const appointmentData = {
      customerId: 'customer-1',
      petId: 'pet-1',
      serviceId: 'invalid-service',
      employeeId: 'employee-1',
      data: '2026-10-10',
      horaInicio: '10:00'
    }

    await assert.rejects(
      async () => {
        await appointmentService.createAppointment(appointmentData)
      },
      (error) => {
        assert.strictEqual(error.code, 'SERVICE_NOT_FOUND')
        return true
      }
    )
  })

  await t.test('Deve rejeitar agendamento sem funcionario valido', async () => {
    mockPrisma('customer', { findFirst: async () => ({ id: 'customer-1', ativo: true }) })
    mockPrisma('pet', { findFirst: async () => ({ id: 'pet-1', customerId: 'customer-1', ativo: true }) })
    mockPrisma('service', { findFirst: async () => ({ id: 'service-1', duracaoEmMinutos: 60, ativo: true }) })
    mockPrisma('employee', { findFirst: async () => null })

    const appointmentData = {
      customerId: 'customer-1',
      petId: 'pet-1',
      serviceId: 'service-1',
      employeeId: 'invalid-employee',
      data: '2026-10-10',
      horaInicio: '10:00'
    }

    await assert.rejects(
      async () => {
        await appointmentService.createAppointment(appointmentData)
      },
      (error) => {
        assert.strictEqual(error.code, 'EMPLOYEE_NOT_FOUND')
        return true
      }
    )
  })

  await t.test('Deve rejeitar agendamento com conflito de horario', async () => {
    mockPrisma('customer', { findFirst: async () => ({ id: 'customer-1', ativo: true }) })
    mockPrisma('pet', { findFirst: async () => ({ id: 'pet-1', customerId: 'customer-1', ativo: true }) })
    mockPrisma('service', { findFirst: async () => ({ id: 'service-1', duracaoEmMinutos: 60, ativo: true }) })
    mockPrisma('employee', { findFirst: async () => ({ id: 'employee-1', ativo: true }) })
    mockPrisma('appointment', {
      findMany: async () => [
        { id: 'existing-1', horaInicio: '09:30', horaFim: '10:30' }
      ]
    })

    const appointmentData = {
      customerId: 'customer-1',
      petId: 'pet-1',
      serviceId: 'service-1',
      employeeId: 'employee-1',
      data: '2026-10-10',
      horaInicio: '10:00'
    }

    await assert.rejects(
      async () => {
        await appointmentService.createAppointment(appointmentData)
      },
      (error) => {
        assert.strictEqual(error.code, 'APPOINTMENT_CONFLICT')
        return true
      }
    )
  })

  await t.test('Deve listar agendamentos com filtros', async () => {
    mockPrisma('appointment', {
      findMany: async () => [
        { id: 'appointment-1', status: 'AGENDADO' }
      ]
    })

    const query = { status: 'AGENDADO' }
    const result = await appointmentService.listAppointments(query)

    assert.strictEqual(result.length, 1)
    assert.strictEqual(result[0].id, 'appointment-1')
  })

  await t.test('Deve atualizar status do agendamento com sucesso', async () => {
    mockPrisma('appointment', {
      findFirst: async () => ({ id: 'appointment-1', status: 'AGENDADO' }),
      update: async (data) => ({ id: 'appointment-1', ...data.data })
    })

    const result = await appointmentService.updateAppointmentStatus('appointment-1', 'CONFIRMADO', 'Confirmado pelo cliente')

    assert.strictEqual(result.status, 'CONFIRMADO')
    assert.strictEqual(result.observacoes, 'Confirmado pelo cliente')
  })

  await t.test('Deve rejeitar atualizacao de status de agendamento inexistente', async () => {
    mockPrisma('appointment', { findFirst: async () => null })

    await assert.rejects(
      async () => {
        await appointmentService.updateAppointmentStatus('invalid-appointment', 'CONFIRMADO')
      },
      (error) => {
        assert.strictEqual(error.code, 'APPOINTMENT_NOT_FOUND')
        return true
      }
    )
  })
})