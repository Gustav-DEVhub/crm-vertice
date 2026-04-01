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
  const year = searchParams.get('year')

  const where: any = {}
  if (year && year !== 'ALL') {
    where.closeDate = {
      gte: new Date(`${year}-01-01`),
      lte: new Date(`${year}-12-31T23:59:59.999Z`)
    }
  }

  try {
    const [total, transactions] = await Promise.all([
      prisma.transaction.count({ where }),
      prisma.transaction.findMany({
        where,
        orderBy: { closeDate: 'desc' },
        skip,
        take,
        include: {
          property: { select: { id: true, address: true, mode: true, city: true } },
          buyer: { select: { id: true, name: true } },
          seller: { select: { id: true, name: true } },
          agent: { select: { id: true, name: true } },
        }
      })
    ])

    return NextResponse.json({
      transactions,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / take)
      }
    })
  } catch (error) {
    console.error('Transactions API error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
