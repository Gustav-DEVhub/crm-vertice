import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-guard'

export async function GET(request: Request) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const take = 30
  const skip = (page - 1) * take
  const action = searchParams.get('action')
  const entity = searchParams.get('entity')

  const where: any = {}
  if (action && action !== 'ALL') where.action = action
  if (entity && entity !== 'ALL') where.entity = entity

  try {
    const [total, logs] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        include: {
          user: { select: { id: true, name: true, email: true } }
        }
      })
    ])

    return NextResponse.json({
      logs,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / take)
      }
    })
  } catch (error) {
    console.error('Audit API error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
