import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-guard'
import dayjs from 'dayjs'

export async function GET(request: Request) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  try {
    const transactions = await prisma.transaction.findMany({
      orderBy: { closeDate: 'desc' },
      include: {
        property: { select: { address: true, mode: true, city: true } },
        buyer: { select: { name: true } },
        seller: { select: { name: true } },
        agent: { select: { name: true } },
      }
    })

    const headers = ['ID', 'Fecha Cierre', 'Operacion', 'Propiedad', 'Ciudad', 'Precio Final', 'Comprador/Inquilino', 'Propietario', 'Agente']
    const rows = transactions.map(t => [
      t.id,
      dayjs(t.closeDate).format('YYYY-MM-DD'),
      t.property.mode === 'SALE' ? 'Venta' : 'Alquiler',
      `"${t.property.address}"`,
      t.property.city,
      t.finalPrice.toString(),
      `"${t.buyer.name}"`,
      `"${t.seller.name}"`,
      `"${t.agent.name}"`
    ])

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')

    return new Response(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="transacciones_${dayjs().format('YYYYMMDD')}.csv"`
      }
    })
  } catch (error) {
    console.error('CSV Export error:', error)
    return new Response('Error generando CSV', { status: 500 })
  }
}
