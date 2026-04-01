import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-guard'
import dayjs from 'dayjs'

export async function GET() {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  try {
    const now = dayjs()
    const startOfWeek = now.startOf('week').toDate()
    const endOfWeek = now.endOf('week').toDate()
    const startOfMonth = now.startOf('month').toDate()
    const endOfMonth = now.endOf('month').toDate()
    const lastMonthStart = now.subtract(1, 'month').startOf('month').toDate()
    const lastMonthEnd = now.subtract(1, 'month').endOf('month').toDate()

    const [
      activePropertiesSale,
      activePropertiesRent,
      visitsThisWeek,
      negotiationsOpen,
      reservasActive,
      commissionsThisMonth,
      commissionsLastMonth,
      pendingCommissions,
      recentActivity,
      pipelineSale,
      pipelineRent,
      agentRanking,
      alertsStalled,
      alertsPendingDocs,
      recentAudit,
      totalRevenueMonth,
    ] = await Promise.all([
      // Active properties by mode
      prisma.property.count({
        where: { mode: 'SALE', currentPhase: { not: 'ESCRITURACION' } },
      }),
      prisma.property.count({
        where: { mode: 'RENT', currentPhase: { not: 'CONTRATO' } },
      }),

      // Visits this week
      prisma.visit.count({
        where: { date: { gte: startOfWeek, lte: endOfWeek } },
      }),

      // Open negotiations
      prisma.property.count({
        where: { currentPhase: 'NEGOCIACION' },
      }),

      // Active reservas
      prisma.property.count({
        where: { currentPhase: 'RESERVA' },
      }),

      // Commissions this month (total amount)
      prisma.commission.aggregate({
        where: { createdAt: { gte: startOfMonth, lte: endOfMonth } },
        _sum: { totalAmount: true },
      }),

      // Commissions last month
      prisma.commission.aggregate({
        where: { createdAt: { gte: lastMonthStart, lte: lastMonthEnd } },
        _sum: { totalAmount: true },
      }),

      // Pending commissions
      prisma.commission.aggregate({
        where: { status: 'PENDING' },
        _sum: { totalAmount: true },
        _count: true,
      }),

      // Recent activity (last 20 phase changes)
      prisma.phaseHistory.findMany({
        take: 20,
        orderBy: { changedAt: 'desc' },
        include: {
          property: { select: { address: true, mode: true, agentId: true, agent: { select: { name: true } } } },
        },
      }),

      // Pipeline: sale properties by phase
      prisma.property.groupBy({
        by: ['currentPhase'],
        where: { mode: 'SALE' },
        _count: true,
      }),

      // Pipeline: rent properties by phase
      prisma.property.groupBy({
        by: ['currentPhase'],
        where: { mode: 'RENT' },
        _count: true,
      }),

      // Agent ranking by transactions
      prisma.agent.findMany({
        where: { isActive: true },
        include: {
          _count: { select: { transactions: true, visits: true } },
          commissions: {
            where: { status: 'PAID' },
            select: { totalAmount: true, agentAmount: true },
          },
        },
        orderBy: { name: 'asc' },
      }),

      // Alerts: properties stalled > 15 days
      prisma.property.findMany({
        where: {
          lastPhaseUpdate: { lt: dayjs().subtract(15, 'day').toDate() },
          currentPhase: { notIn: ['ESCRITURACION', 'CONTRATO'] },
        },
        select: { id: true, address: true, currentPhase: true, lastPhaseUpdate: true, mode: true },
      }),

      // Alerts: pending documents
      prisma.expDoc.count({
        where: { status: 'PENDING' },
      }),

      // Recent audit log
      prisma.auditLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true } } },
      }),

      // Total revenue this month from transactions
      prisma.transaction.aggregate({
        where: { closeDate: { gte: startOfMonth, lte: endOfMonth } },
        _sum: { finalPrice: true },
      }),
    ])

    // Process agent ranking
    const ranking = agentRanking.map((agent) => ({
      id: agent.id,
      name: agent.name,
      avatarUrl: agent.avatarUrl,
      transactions: agent._count.transactions,
      visits: agent._count.visits,
      totalCommissions: agent.commissions.reduce((sum, c) => sum + c.totalAmount, 0),
      agentCommissions: agent.commissions.reduce((sum, c) => sum + c.agentAmount, 0),
    })).sort((a, b) => b.totalCommissions - a.totalCommissions)

    // Process pipeline
    const salePhases = ['CAPTACION', 'DOCUMENTACION', 'PUBLICACION', 'VISITAS', 'NEGOCIACION', 'RESERVA', 'FIRMA', 'ESCRITURACION']
    const rentPhases = ['CAPTACION', 'DOCUMENTACION', 'PUBLICACION', 'VISITAS', 'NEGOCIACION', 'RESERVA', 'CONTRATO']

    const salePipeline = salePhases.map((phase) => ({
      phase,
      count: pipelineSale.find((p) => p.currentPhase === phase)?._count || 0,
    }))

    const rentPipeline = rentPhases.map((phase) => ({
      phase,
      count: pipelineRent.find((p) => p.currentPhase === phase)?._count || 0,
    }))

    // Process alerts
    const alerts = [
      ...alertsStalled.map((p) => ({
        type: 'stalled' as const,
        message: `${p.address} lleva ${dayjs().diff(dayjs(p.lastPhaseUpdate), 'day')} días en ${p.currentPhase}`,
        propertyId: p.id,
        mode: p.mode,
      })),
      ...(alertsPendingDocs > 0
        ? [{ type: 'docs' as const, message: `${alertsPendingDocs} documentos pendientes de entrega`, propertyId: null, mode: null }]
        : []),
      ...(pendingCommissions._count > 0
        ? [{ type: 'commission' as const, message: `${pendingCommissions._count} comisiones pendientes de cobro (€${(pendingCommissions._sum.totalAmount || 0).toLocaleString('es-ES')})`, propertyId: null, mode: null }]
        : []),
    ]

    const thisMonthTotal = commissionsThisMonth._sum.totalAmount || 0
    const lastMonthTotal = commissionsLastMonth._sum.totalAmount || 0
    const commissionChange = lastMonthTotal > 0
      ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal * 100).toFixed(1)
      : '0'

    return NextResponse.json({
      kpis: {
        activePropertiesSale,
        activePropertiesRent,
        visitsThisWeek,
        negotiationsOpen,
        reservasActive,
        revenueMonth: totalRevenueMonth._sum.finalPrice || 0,
        commissionsMonth: thisMonthTotal,
        commissionChange: parseFloat(commissionChange as string),
        pendingCommissions: pendingCommissions._sum.totalAmount || 0,
      },
      pipeline: { sale: salePipeline, rent: rentPipeline },
      ranking,
      recentActivity: recentActivity.map((a) => ({
        id: a.id,
        property: a.property.address,
        phase: a.phase,
        changedAt: a.changedAt,
        agent: a.property.agent?.name || 'Sin asignar',
        mode: a.property.mode,
      })),
      alerts,
      auditLog: recentAudit.map((log) => ({
        id: log.id,
        action: log.action,
        entity: log.entity,
        entityId: log.entityId,
        user: log.user.name,
        createdAt: log.createdAt,
      })),
    })
  } catch (error) {
    console.error('Dashboard error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
