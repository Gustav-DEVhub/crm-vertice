import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-guard'
import { ExpDocStatus } from '@prisma/client'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  try {
    const expediente = await prisma.expediente.findUnique({
      where: { id: params.id },
      include: {
        documents: { orderBy: { createdAt: 'desc' } },
        property: {
          select: { id: true, address: true, city: true, currentPhase: true, mode: true },
        },
        transaction: {
          include: {
            buyer: { select: { id: true, name: true, phone: true, email: true } },
            seller: { select: { id: true, name: true, phone: true, email: true } },
            agent: { select: { id: true, name: true, phone: true, email: true } }
          }
        }
      }
    })

    if (!expediente) {
      return NextResponse.json({ error: 'Expediente no encontrado' }, { status: 404 })
    }

    return NextResponse.json({ expediente })
  } catch (error) {
    console.error('Expediente GET error:', error)
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
    const { docId, status } = await request.json()
    
    // Update specific document status
    if (docId && status) {
       const updatedDoc = await prisma.expDoc.update({
         where: { id: docId },
         data: { status: status as ExpDocStatus }
       })

       await prisma.auditLog.create({
         data: {
           userId: auth.session.user.id,
           action: 'UPDATE',
           entity: 'ExpDoc',
           entityId: updatedDoc.id,
           ip: request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1',
           userAgent: request.headers.get('user-agent') || 'Unknown',
         }
       })

       // check if all docs validate to auto-update expediente status
       const allDocs = await prisma.expDoc.findMany({ where: { expedienteId: params.id }})
       const allValidated = allDocs.every(d => d.status === 'VALIDATED')
       if (allValidated) {
          await prisma.expediente.update({
             where: { id: params.id },
             data: { status: 'COMPLETADO' }
          })
       }

       return NextResponse.json({ success: true, doc: updatedDoc })
    }

    return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
  } catch (error) {
    console.error('Update doc error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
