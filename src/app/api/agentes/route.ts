import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-guard'

export async function GET() {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  try {
    const agents = await prisma.agent.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            properties: { where: { currentPhase: { notIn: ['ESCRITURACION', 'CONTRATO'] } } },
            visits: true,
            transactions: true
          }
        },
        commissions: {
          where: { status: 'PAID' },
          select: { totalAmount: true, agentAmount: true }
        }
      }
    })

    const data = agents.map(a => ({
      id: a.id,
      name: a.name,
      email: a.email,
      phone: a.phone,
      avatarUrl: a.avatarUrl,
      isActive: a.isActive,
      commissionPct: a.commissionPct,
      joinDate: a.joinDate,
      activeProperties: a._count.properties,
      totalVisits: a._count.visits,
      totalTransactions: a._count.transactions,
      generatedRevenue: a.commissions.reduce((sum, c) => sum + c.totalAmount, 0),
      earnedCommissions: a.commissions.reduce((sum, c) => sum + c.agentAmount, 0),
    }))

    return NextResponse.json({ agents: data })
  } catch (error) {
    console.error('Agents API error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  try {
    const body = await request.json()
    const { name, email, phone, commissionPct, joinDate } = body

    const newAgent = await prisma.agent.create({
      data: {
        name,
        email,
        phone,
        commissionPct: Number(commissionPct),
        joinDate: new Date(joinDate),
        isActive: true,
        avatarUrl: `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&seed=${name}`
      }
    })
    
    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: auth.session.user.id,
        action: 'CREATE',
        entity: 'Agent',
        entityId: newAgent.id,
        ip: request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1',
        userAgent: request.headers.get('user-agent') || 'Unknown',
      }
    })

    return NextResponse.json({ agent: newAgent })
  } catch (error) {
    console.error('Create agent error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
