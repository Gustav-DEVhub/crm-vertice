import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-guard'
import dayjs from 'dayjs'

export async function GET(request: Request) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const { searchParams } = new URL(request.url)
  const agentId = searchParams.get('agentId')
  const status = searchParams.get('status')
  const limit = parseInt(searchParams.get('limit') || '50')

  const where: any = {}
  if (agentId && agentId !== 'ALL') where.agentId = agentId
  if (status && status !== 'ALL') where.status = status

  try {
    const commissions = await prisma.commission.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        agent: { select: { name: true } },
        transaction: {
          include: { property: { select: { address: true, mode: true } } }
        }
      }
    })

    // Calculate generic summary metrics for the whole agency
    const now = dayjs()
    const allCommissions = await prisma.commission.findMany({
      select: { totalAmount: true, agentAmount: true, agencyAmount: true, status: true, paidAt: true, createdAt: true }
    })

    const summary = {
      totalPending: 0,
      totalPaidMonth: 0,
      totalPaidYear: 0,
      agencyRevenueMonth: 0,
      agencyRevenueYear: 0,
    }

    allCommissions.forEach(c => {
      if (c.status === 'PENDING') {
        summary.totalPending += c.totalAmount
      }
      if (c.status === 'PAID' && c.paidAt) {
        const isThisMonth = dayjs(c.paidAt).isSame(now, 'month')
        const isThisYear = dayjs(c.paidAt).isSame(now, 'year')

        if (isThisMonth) {
          summary.totalPaidMonth += c.totalAmount
          summary.agencyRevenueMonth += c.agencyAmount
        }
        if (isThisYear) {
          summary.totalPaidYear += c.totalAmount
          summary.agencyRevenueYear += c.agencyAmount
        }
      }
    })

    return NextResponse.json({
      commissions,
      summary
    })
  } catch (error) {
    console.error('Commissions API error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  try {
    const { id, status } = await request.json()
    
    if (status !== 'PAID' && status !== 'PENDING') {
       return NextResponse.json({ error: 'Estado inválido' }, { status: 400 })
    }

    const commission = await prisma.commission.update({
      where: { id },
      data: {
        status,
        paidAt: status === 'PAID' ? new Date() : null
      }
    })

    await prisma.auditLog.create({
      data: {
        userId: auth.session.user.id,
        action: 'UPDATE',
        entity: 'Commission',
        entityId: commission.id,
        ip: request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1',
        userAgent: request.headers.get('user-agent') || 'Unknown',
      }
    })

    return NextResponse.json({ success: true, commission })
  } catch (error) {
    console.error('Commission PUT error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
