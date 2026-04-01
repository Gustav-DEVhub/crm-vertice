import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/options'
import { NextResponse } from 'next/server'

export async function requireAuth() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return {
      error: NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      ),
      session: null,
    }
  }
  return { session, error: null }
}
