import prisma from '../../database/prisma.js'

export class ReportService {
  async getSalesReport(query) {
    const { dataInicial, dataFinal, status } = query
    const where = {}

    if (dataInicial && dataFinal) {
      where.createdAt = {
        gte: new Date(`${dataInicial}T00:00:00.000Z`),
        lte: new Date(`${dataFinal}T23:59:59.999Z`)
      }
    }
    if (status) {
      where.status = status
    }

    return prisma.sale.findMany({
      where,
      include: {
        customer: true,
        items: true
      },
      orderBy: { createdAt: 'desc' }
    })
  }

  async getRevenueReport(query) {
    const { dataInicial, dataFinal } = query
    const where = { status: 'PAGA' }

    if (dataInicial && dataFinal) {
      where.createdAt = {
        gte: new Date(`${dataInicial}T00:00:00.000Z`),
        lte: new Date(`${dataFinal}T23:59:59.999Z`)
      }
    }

    const sales = await prisma.sale.findMany({ where })

    const totalRevenue = sales.reduce((acc, sale) => acc + Number(sale.total), 0)
    const totalDiscounts = sales.reduce((acc, sale) => acc + Number(sale.desconto), 0)

    return {
      quantidadeVendas: sales.length,
      faturamentoTotal: totalRevenue,
      descontosAplicados: totalDiscounts
    }
  }

  async getTopProducts(query) {
    const { dataInicial, dataFinal, limit = 10 } = query
    const where = { productId: { not: null }, sale: { status: 'PAGA' } }

    if (dataInicial && dataFinal) {
      where.sale.createdAt = {
        gte: new Date(`${dataInicial}T00:00:00.000Z`),
        lte: new Date(`${dataFinal}T23:59:59.999Z`)
      }
    }

    const items = await prisma.saleItem.groupBy({
      by: ['productId', 'nome'],
      where,
      _sum: {
        quantidade: true,
        subtotal: true
      },
      orderBy: {
        _sum: {
          quantidade: 'desc'
        }
      },
      take: Number(limit)
    })

    return items.map(item => ({
      productId: item.productId,
      nome: item.nome,
      quantidadeVendida: item._sum.quantidade,
      faturamentoGerado: item._sum.subtotal
    }))
  }

  async getTopServices(query) {
    const { dataInicial, dataFinal, limit = 10 } = query
    const where = { serviceId: { not: null }, sale: { status: 'PAGA' } }

    if (dataInicial && dataFinal) {
      where.sale.createdAt = {
        gte: new Date(`${dataInicial}T00:00:00.000Z`),
        lte: new Date(`${dataFinal}T23:59:59.999Z`)
      }
    }

    const items = await prisma.saleItem.groupBy({
      by: ['serviceId', 'nome'],
      where,
      _sum: {
        quantidade: true,
        subtotal: true
      },
      orderBy: {
        _sum: {
          quantidade: 'desc'
        }
      },
      take: Number(limit)
    })

    return items.map(item => ({
      serviceId: item.serviceId,
      nome: item.nome,
      quantidadeExecutada: item._sum.quantidade,
      faturamentoGerado: item._sum.subtotal
    }))
  }

  async getAppointmentsReport(query) {
    const { dataInicial, dataFinal, employeeId, status } = query
    const where = { deletedAt: null }

    if (dataInicial && dataFinal) {
      where.data = {
        gte: new Date(`${dataInicial}T00:00:00.000Z`),
        lte: new Date(`${dataFinal}T23:59:59.999Z`)
      }
    }
    if (employeeId) where.employeeId = employeeId
    if (status) where.status = status

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        customer: true,
        pet: true,
        service: true,
        employee: true
      },
      orderBy: { data: 'desc' }
    })

    const statusCount = appointments.reduce((acc, appt) => {
      acc[appt.status] = (acc[appt.status] || 0) + 1
      return acc
    }, {})

    return {
      total: appointments.length,
      distribuicaoStatus: statusCount,
      agendamentos: appointments
    }
  }
}