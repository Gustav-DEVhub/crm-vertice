import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-guard'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  try {
    const property = await prisma.property.findUnique({
      where: { id: params.id },
      include: {
        agent: { select: { id: true, name: true, phone: true, email: true } },
        photos: { orderBy: { order: 'asc' } },
        phaseHistory: { orderBy: { changedAt: 'desc' } },
        visits: {
          orderBy: { date: 'desc' },
          include: {
            client: { select: { id: true, name: true } },
            agent: { select: { id: true, name: true } }
          }
        },
        transactions: {
          include: {
            buyer: { select: { id: true, name: true } },
            seller: { select: { id: true, name: true } }
          }
        },
        expedientes: {
          include: {
            documents: { orderBy: { createdAt: 'desc' } }
          }
        }
      }
    })

    if (!property) {
      return NextResponse.json({ error: 'Propiedad no encontrada' }, { status: 404 })
    }

    return NextResponse.json({ property })
  } catch (error) {
    console.error('Property detail GET error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
