import { prisma } from '@/lib/prisma'

interface AuditLogParams {
  userId: string
  action: 'CREATE' | 'UPDATE' | 'DELETE'
  entity: string
  entityId: string
  oldValue?: Record<string, unknown> | null
  newValue?: Record<string, unknown> | null
  ip: string
  userAgent: string
}

export async function createAuditLog(params: AuditLogParams) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        oldValue: params.oldValue ?? undefined,
        newValue: params.newValue ?? undefined,
        ip: params.ip,
        userAgent: params.userAgent,
      },
    })
  } catch (error) {
    console.error('Error creating audit log:', error)
  }
}

export function getClientInfo(request: Request) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    '127.0.0.1'
  const userAgent = request.headers.get('user-agent') || 'Unknown'
  return { ip, userAgent }
}
