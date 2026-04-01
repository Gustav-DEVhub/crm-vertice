import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-guard'

export async function GET(request: Request) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') || 'visits' // 'visits' or 'negotiations'
  const page = parseInt(searchParams.get('page') || '1')
  const take = 30
  const skip = (page - 1) * take

  try {
    if (type === 'visits') {
      const [total, visits] = await Promise.all([
        prisma.visit.count(),
        prisma.visit.findMany({
          orderBy: { date: 'desc' },
          skip,
          take,
          include: {
            property: { select: { id: true, address: true, mode: true, price: true } },
            client: { select: { id: true, name: true, phone: true } },
            agent: { select: { id: true, name: true } },
          }
        })
      ])

      return NextResponse.json({
        type: 'visits',
        data: visits,
        pagination: { total, page, totalPages: Math.ceil(total / take) }
      })
    } else {
      // Negotiations & Reservations -> Properties currently in those phases + PhaseHistory
      const [total, properties] = await Promise.all([
        prisma.property.count({
          where: { currentPhase: { in: ['NEGOCIACION', 'RESERVA'] } }
        }),
        prisma.property.findMany({
          where: { currentPhase: { in: ['NEGOCIACION', 'RESERVA'] } },
          orderBy: { lastPhaseUpdate: 'desc' },
          skip,
          take,
          include: {
            agent: { select: { id: true, name: true } }
          }
        })
      ])

      return NextResponse.json({
        type: 'negotiations',
        data: properties,
        pagination: { total, page, totalPages: Math.ceil(total / take) }
      })
    }
  } catch (error) {
    console.error('Activity API error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
