import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-guard'
import { PropertyMode } from '@prisma/client'

export async function GET(request: Request) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const { searchParams } = new URL(request.url)
  const modeParam = searchParams.get('mode') as PropertyMode | null
  const page = parseInt(searchParams.get('page') || '1')
  const take = 25
  const skip = (page - 1) * take

  const phase = searchParams.get('phase')
  const agentId = searchParams.get('agentId')
  const type = searchParams.get('type')
  const q = searchParams.get('q')

  const where: any = {}
  
  if (modeParam) where.mode = modeParam
  if (phase && phase !== 'ALL') where.currentPhase = phase
  if (agentId && agentId !== 'ALL') where.agentId = agentId
  if (type && type !== 'ALL') where.type = type
  if (q) {
    where.OR = [
      { address: { contains: q, mode: 'insensitive' } },
      { city: { contains: q, mode: 'insensitive' } },
    ]
  }

  try {
    const [total, properties] = await Promise.all([
      prisma.property.count({ where }),
      prisma.property.findMany({
        where,
        include: {
          agent: { select: { id: true, name: true } },
          photos: { select: { url: true }, take: 1, orderBy: { order: 'asc' } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      })
    ])

    return NextResponse.json({
      properties,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / take)
      }
    })
  } catch (error) {
    console.error('Properties API error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
