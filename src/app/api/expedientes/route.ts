import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-guard'

export async function GET(request: Request) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const take = 25
  const skip = (page - 1) * take
  const status = searchParams.get('status')

  const where: any = {}
  if (status && status !== 'ALL') {
    where.status = status
  }

  try {
    const [total, expedientes] = await Promise.all([
      prisma.expediente.count({ where }),
      prisma.expediente.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take,
        include: {
          property: { select: { id: true, address: true, city: true, currentPhase: true, mode: true } },
          transaction: {
            select: {
              buyer: { select: { name: true } },
              seller: { select: { name: true } },
              agent: { select: { name: true } }
            }
          },
          _count: { select: { documents: true } }
        }
      })
    ])

    return NextResponse.json({
      expedientes,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / take)
      }
    })
  } catch (error) {
    console.error('Expedientes API error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
