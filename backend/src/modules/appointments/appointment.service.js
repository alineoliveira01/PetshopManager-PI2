import prisma from '../../database/prisma.js'
import { AppError } from '../../errors/AppError.js'

export class AppointmentService {
  async createAppointment(data) {
    const { customerId, petId, serviceId, employeeId, data: appointmentDate, horaInicio, observacoes } = data

    const customer = await prisma.customer.findFirst({
      where: { id: customerId, deletedAt: null, ativo: true }
    })
    if (!customer) {
      throw new AppError('Cliente não encontrado ou inativo', 400, 'CUSTOMER_NOT_FOUND')
    }

    const pet = await prisma.pet.findFirst({
      where: { id: petId, customerId, deletedAt: null, ativo: true }
    })
    if (!pet) {
      throw new AppError('Pet não encontrado ou não pertence ao cliente informado', 400, 'INVALID_PET')
    }

    const service = await prisma.service.findFirst({
      where: { id: serviceId, deletedAt: null, ativo: true }
    })
    if (!service) {
      throw new AppError('Serviço não encontrado ou inativo', 400, 'SERVICE_NOT_FOUND')
    }

    const employee = await prisma.employee.findFirst({
      where: { id: employeeId, deletedAt: null, ativo: true }
    })
    if (!employee) {
      throw new AppError('Funcionário não encontrado ou inativo', 400, 'EMPLOYEE_NOT_FOUND')
    }

    const [hours, minutes] = horaInicio.split(':').map(Number)
    const startMinutes = hours * 60 + minutes
    const endMinutes = startMinutes + service.duracaoEmMinutos
    const endHour = Math.floor(endMinutes / 60).toString().padStart(2, '0')
    const endMin = (endMinutes % 60).toString().padStart(2, '0')
    const horaFim = `${endHour}:${endMin}`

    const parsedDate = new Date(`${appointmentDate}T00:00:00.000Z`)

    const existingAppointments = await prisma.appointment.findMany({
      where: {
        employeeId,
        data: parsedDate,
        status: { notIn: ['CANCELADO'] },
        deletedAt: null
      }
    })

    for (const appt of existingAppointments) {
      const [aStartH, aStartM] = appt.horaInicio.split(':').map(Number)
      const [aEndH, aEndM] = appt.horaFim.split(':').map(Number)
      const aStart = aStartH * 60 + aStartM
      const aEnd = aEndH * 60 + aEndM

      if (startMinutes < aEnd && endMinutes > aStart) {
        throw new AppError('Conflito de horário: o funcionário já possui agendamento neste período', 409, 'APPOINTMENT_CONFLICT')
      }
    }

    return prisma.appointment.create({
      data: {
        customerId,
        petId,
        serviceId,
        employeeId,
        data: parsedDate,
        horaInicio,
        horaFim,
        status: 'AGENDADO',
        observacoes
      },
      include: {
        customer: true,
        pet: true,
        service: true,
        employee: true
      }
    })
  }

  async listAppointments(query) {
    const { date, startDate, endDate, employeeId, petId, customerId, status } = query
    const where = { deletedAt: null }

    if (date) {
      where.data = new Date(`${date}T00:00:00.000Z`)
    } else if (startDate && endDate) {
      where.data = {
        gte: new Date(`${startDate}T00:00:00.000Z`),
        lte: new Date(`${endDate}T23:59:59.999Z`)
      }
    }

    if (employeeId) where.employeeId = employeeId
    if (petId) where.petId = petId
    if (customerId) where.customerId = customerId
    if (status) where.status = status

    return prisma.appointment.findMany({
      where,
      include: {
        customer: true,
        pet: true,
        service: true,
        employee: true
      },
      orderBy: { data: 'asc' }
    })
  }

  async updateAppointmentStatus(id, status, observacoes) {
    const appointment = await prisma.appointment.findFirst({
      where: { id, deletedAt: null }
    })
    if (!appointment) {
      throw new AppError('Agendamento não encontrado', 404, 'APPOINTMENT_NOT_FOUND')
    }

    return prisma.appointment.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(observacoes && { observacoes })
      }
    })
  }
}