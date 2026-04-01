import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-guard'
import { ExternalProfType } from '@prisma/client'

export async function GET(request: Request) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')
  const type = searchParams.get('type') as ExternalProfType | null

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
    const professionals = await prisma.externalProf.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        transactions: {
          take: 5,
          orderBy: { closeDate: 'desc' },
          include: { property: { select: { address: true } } }
        },
        _count: { select: { transactions: true } }
      }
    })

    return NextResponse.json({ professionals })
  } catch (error) {
    console.error('External API error:', error)
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
    const { name, type, phone, email } = body

    const prof = await prisma.externalProf.create({
      data: { name, type, phone, email }
    })

    await prisma.auditLog.create({
      data: {
        userId: auth.session.user.id,
        action: 'CREATE',
        entity: 'ExternalProf',
        entityId: prof.id,
        ip: request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1',
        userAgent: request.headers.get('user-agent') || 'Unknown',
      }
    })

    return NextResponse.json({ professional: prof })
  } catch (error) {
    console.error('Create Prof error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
