import prisma from '../../database/prisma.js'

export class DashboardService {
  async getDashboardData(query) {
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todayEnd = new Date()
    todayEnd.setHours(23, 59, 59, 999)

    const monthStart = new Date(todayStart.getFullYear(), todayStart.getMonth(), 1)
    const monthEnd = new Date(todayStart.getFullYear(), todayStart.getMonth() + 1, 0, 23, 59, 59, 999)

    const [
      totalCustomers,
      totalPets,
      totalProducts,
      totalServices,
      totalEmployees,
      salesToday,
      salesMonth,
      appointmentsToday,
      upcomingAppointments,
      lowStockProducts
    ] = await Promise.all([
      prisma.customer.count({ where: { deletedAt: null } }),
      prisma.pet.count({ where: { deletedAt: null } }),
      prisma.product.count({ where: { deletedAt: null } }),
      prisma.service.count({ where: { deletedAt: null } }),
      prisma.employee.count({ where: { deletedAt: null } }),
      prisma.sale.findMany({
        where: { createdAt: { gte: todayStart, lte: todayEnd }, status: 'PAGA' }
      }),
      prisma.sale.findMany({
        where: { createdAt: { gte: monthStart, lte: monthEnd }, status: 'PAGA' }
      }),
      prisma.appointment.count({
        where: { data: { gte: todayStart, lte: todayEnd }, status: { not: 'CANCELADO' }, deletedAt: null }
      }),
      prisma.appointment.findMany({
        where: { data: { gte: todayStart }, status: { not: 'CANCELADO' }, deletedAt: null },
        take: 10,
        orderBy: { data: 'asc' },
        include: { customer: true, pet: true, service: true, employee: true }
      }),
      prisma.product.findMany({
        where: {
          deletedAt: null,
          ativo: true,
          estoqueAtual: { lte: prisma.product.fields.estoqueMinimo }
        }
      })
    ])

    const revenueToday = salesToday.reduce((acc, sale) => acc + Number(sale.total), 0)
    const revenueMonth = salesMonth.reduce((acc, sale) => acc + Number(sale.total), 0)

    return {
      totais: {
        clientes: totalCustomers,
        pets: totalPets,
        produtos: totalProducts,
        servicos: totalServices,
        funcionarios: totalEmployees
      },
      vendas: {
        quantidadeHoje: salesToday.length,
        quantidadeMes: salesMonth.length,
        faturamentoHoje: revenueToday,
        faturamentoMes: revenueMonth
      },
      agenda: {
        agendamentosHoje: appointmentsToday,
        proximos: upcomingAppointments
      },
      estoque: {
        produtosEstoqueBaixo: lowStockProducts
      }
    }
  }
}