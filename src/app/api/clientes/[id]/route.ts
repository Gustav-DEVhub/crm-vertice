import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-guard'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  try {
    const client = await prisma.client.findUnique({
      where: { id: params.id },
      include: {
        visits: {
          orderBy: { date: 'desc' },
          include: {
            agent: { select: { id: true, name: true } },
            property: { select: { id: true, address: true, mode: true, price: true } }
          }
        },
        boughtProperties: {
          orderBy: { closeDate: 'desc' },
          include: {
            property: { select: { id: true, address: true, type: true } },
            agent: { select: { id: true, name: true } }
          }
        },
        soldProperties: {
          orderBy: { closeDate: 'desc' },
          include: {
            property: { select: { id: true, address: true, type: true } },
            agent: { select: { id: true, name: true } }
          }
        }
      }
    })

    if (!client) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
    }

    return NextResponse.json({ client })
  } catch (error) {
    console.error('Client GET error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  try {
    const body = await request.json()
    const { name, email, phone, budget, preferences, status } = body

    const oldClient = await prisma.client.findUnique({ where: { id: params.id } })

    const updated = await prisma.client.update({
      where: { id: params.id },
      data: {
        name,
        email,
        phone,
        ...(budget !== undefined && { budget: budget ? Number(budget) : null }),
        ...(preferences !== undefined && { preferences }),
        ...(status !== undefined && { status })
      }
    })

    await prisma.auditLog.create({
      data: {
        userId: auth.session.user.id,
        action: 'UPDATE',
        entity: 'Client',
        entityId: updated.id,
        oldValue: oldClient as any,
        newValue: updated as any,
        ip: request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1',
        userAgent: request.headers.get('user-agent') || 'Unknown',
      }
    })

    return NextResponse.json({ client: updated })
  } catch (error) {
    console.error('Update client error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  try {
    const client = await prisma.client.findUnique({
      where: { id: params.id },
      include: { _count: { select: { boughtProperties: true, soldProperties: true, visits: true } } }
    })

    if (!client) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
    }

    if (client._count.boughtProperties > 0 || client._count.soldProperties > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar un cliente con transacciones asociadas (RGPD: Bloqueo de conservación de datos contables).' },
        { status: 400 }
      )
    }

    // Cascade delete visits manually if needed or let DB handle it if onDelete: Cascade is configured
    // Let's rely on Prisma to cascade `visits` implicitly since it has onDelete: Cascade in schema
    await prisma.client.delete({ where: { id: params.id } })

    await prisma.auditLog.create({
      data: {
        userId: auth.session.user.id,
        action: 'DELETE',
        entity: 'Client',
        entityId: params.id,
        oldValue: client as any,
        ip: request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1',
        userAgent: request.headers.get('user-agent') || 'Unknown',
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete client error:', error)
    return NextResponse.json(
      { error: 'Error interno al intentar eliminar (verifique restricciones de DB)' },
      { status: 500 }
    )
  }
}
