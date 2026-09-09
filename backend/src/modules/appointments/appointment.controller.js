import { AppointmentService } from './appointment.service.js'

const appointmentService = new AppointmentService()

export class AppointmentController {
  async create(req, res, next) {
    try {
      const appointment = await appointmentService.createAppointment(req.body)
      return res.status(201).json({ success: true, data: appointment })
    } catch (error) {
      next(error)
    }
  }

  async list(req, res, next) {
    try {
      const appointments = await appointmentService.listAppointments(req.query)
      return res.status(200).json({
        success: true,
        data: appointments,
        total: appointments.length
      })
    } catch (error) {
      next(error)
    }
  }

  async update(req, res, next) {
    try {
      const appointment = await appointmentService.updateAppointmentStatus(
        req.params.id,
        req.body.status,
        req.body.observacoes
      )
      return res.status(200).json({ success: true, data: appointment })
    } catch (error) {
      next(error)
    }
  }

  async delete(req, res, next) {
    try {
      await appointmentService.updateAppointmentStatus(req.params.id, 'CANCELADO')
      return res.status(204).send()
    } catch (error) {
      next(error)
    }
  }
}