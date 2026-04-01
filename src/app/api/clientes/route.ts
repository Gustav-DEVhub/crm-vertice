import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-guard'
import { ClientType } from '@prisma/client'

export async function GET(request: Request) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const take = 25
  const skip = (page - 1) * take

  const q = searchParams.get('q')
  const type = searchParams.get('type') as ClientType | null

  const where: any = {}
  
  if (type && type !== 'ALL') where.type = type
  if (q) {
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { email: { contains: q, mode: 'insensitive' } },
      { phone: { contains: q, mode: 'insensitive' } },
    ]
  }

  try {
    const [total, clients] = await Promise.all([
      prisma.client.count({ where }),
      prisma.client.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        include: {
          _count: { select: { visits: true, boughtProperties: true, soldProperties: true } }
        }
      })
    ])

    return NextResponse.json({
      clients,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / take)
      }
    })
  } catch (error) {
    console.error('Clients API error:', error)
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
    const { name, email, phone, type, origin, sourceId, budget, preferences } = body

    const newClient = await prisma.client.create({
      data: {
        name,
        email,
        phone,
        type,
        origin,
        sourceId,
        budget: budget ? Number(budget) : null,
        preferences,
        status: 'ACTIVE'
      }
    })
    
    await prisma.auditLog.create({
      data: {
        userId: auth.session.user.id,
        action: 'CREATE',
        entity: 'Client',
        entityId: newClient.id,
        ip: request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1',
        userAgent: request.headers.get('user-agent') || 'Unknown',
      }
    })

    return NextResponse.json({ client: newClient })
  } catch (error) {
    console.error('Create client error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
