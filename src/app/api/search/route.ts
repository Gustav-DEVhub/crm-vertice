import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-guard'

export async function GET(request: Request) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim()

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] })
  }

  try {
    const [properties, clients, agents] = await Promise.all([
      prisma.property.findMany({
        where: {
          OR: [
            { address: { contains: q, mode: 'insensitive' } },
            { city: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 5,
        select: { id: true, address: true, city: true, mode: true, price: true },
      }),
      prisma.client.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { email: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 5,
        select: { id: true, name: true, email: true, type: true },
      }),
      prisma.agent.findMany({
        where: {
          name: { contains: q, mode: 'insensitive' },
        },
        take: 5,
        select: { id: true, name: true, email: true },
      }),
    ])

    const results = [
      ...properties.map((p) => ({
        type: 'property' as const,
        id: p.id,
        title: p.address,
        subtitle: `${p.city} · ${p.mode === 'SALE' ? 'Venta' : 'Alquiler'} · €${p.price.toLocaleString('es-ES')}`,
      })),
      ...clients.map((c) => ({
        type: 'client' as const,
        id: c.id,
        title: c.name,
        subtitle: `${c.email} · ${c.type === 'OWNER' ? 'Propietario' : c.type === 'BUYER' ? 'Comprador' : 'Inquilino'}`,
      })),
      ...agents.map((a) => ({
        type: 'agent' as const,
        id: a.id,
        title: a.name,
        subtitle: a.email,
      })),
    ]

    return NextResponse.json({ results })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
