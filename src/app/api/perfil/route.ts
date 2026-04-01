import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-guard'
import bcrypt from 'bcryptjs'

export async function GET(request: Request) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  try {
    const user = await prisma.user.findUnique({
      where: { id: auth.session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Profile API error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  try {
    const { name, email, currentPassword, newPassword } = await request.json()

    // Find the user to verify pw
    const user = await prisma.user.findUnique({ where: { id: auth.session.user.id } })
    if (!user) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })

    const updateData: any = {}

    if (name) updateData.name = name
    if (email) updateData.email = email

    if (currentPassword && newPassword) {
       const isValid = await bcrypt.compare(currentPassword, user.password)
       if (!isValid) {
         return NextResponse.json({ error: 'Contraseña actual incorrecta' }, { status: 400 })
       }
       updateData.password = await bcrypt.hash(newPassword, 12)
    }

    if (Object.keys(updateData).length > 0) {
       await prisma.user.update({
         where: { id: auth.session.user.id },
         data: updateData
       })

       await prisma.auditLog.create({
         data: {
           userId: auth.session.user.id,
           action: 'UPDATE',
           entity: 'User',
           entityId: auth.session.user.id,
           ip: request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1',
           userAgent: request.headers.get('user-agent') || 'Unknown',
         }
       })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Profile PUT error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
