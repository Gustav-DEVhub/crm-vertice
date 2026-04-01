import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-guard'
import dayjs from 'dayjs'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  try {
    const agent = await prisma.agent.findUnique({
      where: { id: params.id },
      include: {
        properties: {
          orderBy: { createdAt: 'desc' },
          select: { id: true, address: true, mode: true, currentPhase: true, price: true }
        },
        transactions: {
          orderBy: { closeDate: 'desc' },
          include: { property: { select: { address: true, mode: true } } }
        },
        commissions: {
          orderBy: { createdAt: 'desc' },
          include: { transaction: { select: { property: { select: { address: true } } } } }
        },
        visits: {
          orderBy: { date: 'desc' },
          take: 50,
          include: { property: { select: { address: true } }, client: { select: { name: true } } }
        }
      }
    })

    if (!agent) {
      return NextResponse.json({ error: 'Agente no encontrado' }, { status: 404 })
    }

    // Process monthly chart data for the last 6 months
    const now = dayjs()
    const months = Array.from({ length: 6 }).map((_, i) => now.subtract(5 - i, 'month').format('MMM YY'))
    
    const chartData = months.map(monthLabel => {
      let sales = 0
      let rents = 0
      let visits = 0

      agent.transactions.forEach(t => {
        if (dayjs(t.closeDate).format('MMM YY') === monthLabel) {
          if (t.property.mode === 'SALE') sales++
          else rents++
        }
      })

      agent.visits.forEach(v => {
        if (dayjs(v.date).format('MMM YY') === monthLabel) visits++
      })

      return { month: monthLabel, ventas: sales, alquileres: rents, visitas: visits }
    })

    return NextResponse.json({ agent, chartData })
  } catch (error) {
    console.error('Agent detail GET error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  try {
    const body = await request.json()
    const { name, email, phone, commissionPct, isActive } = body

    const oldAgent = await prisma.agent.findUnique({ where: { id: params.id } })

    const updatedAgent = await prisma.agent.update({
      where: { id: params.id },
      data: {
        name,
        email,
        phone,
        ...(commissionPct !== undefined && { commissionPct: Number(commissionPct) }),
        ...(isActive !== undefined && { isActive }),
      }
    })

    await prisma.auditLog.create({
      data: {
        userId: auth.session.user.id,
        action: 'UPDATE',
        entity: 'Agent',
        entityId: updatedAgent.id,
        oldValue: oldAgent as any,
        newValue: updatedAgent as any,
        ip: request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1',
        userAgent: request.headers.get('user-agent') || 'Unknown',
      }
    })

    return NextResponse.json({ agent: updatedAgent })
  } catch (error) {
    console.error('Update agent error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
