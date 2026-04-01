import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z
    .string()
    .url('DATABASE_URL debe ser una URL de PostgreSQL válida')
    .startsWith('postgresql://', 'DATABASE_URL debe comenzar con postgresql://'),
  DIRECT_URL: z
    .string()
    .url('DIRECT_URL debe ser una URL de PostgreSQL válida')
    .optional(),
  NEXTAUTH_SECRET: z
    .string()
    .min(32, 'NEXTAUTH_SECRET debe tener al menos 32 caracteres'),
  NEXTAUTH_URL: z
    .string()
    .url('NEXTAUTH_URL debe ser una URL válida'),
  ENCRYPTION_KEY: z
    .string()
    .length(64, 'ENCRYPTION_KEY debe tener exactamente 64 caracteres hexadecimales (32 bytes)'),
  SUPABASE_URL: z
    .string()
    .url('SUPABASE_URL debe ser una URL válida')
    .optional()
    .default('https://placeholder.supabase.co'),
  SUPABASE_ANON_KEY: z
    .string()
    .min(1, 'SUPABASE_ANON_KEY es requerida')
    .optional()
    .default('placeholder'),
  SUPABASE_STORAGE_BUCKET: z
    .string()
    .min(1)
    .optional()
    .default('property-photos'),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
})

export type Env = z.infer<typeof envSchema>

function validateEnv(): Env {
  const parsed = envSchema.safeParse(process.env)

  if (!parsed.success) {
    const errors = parsed.error.issues
      .map((issue) => `  ✗ ${issue.path.join('.')}: ${issue.message}`)
      .join('\n')

    console.error(
      '\n╔══════════════════════════════════════════════════╗\n' +
      '║  ❌ Error de configuración: Variables de entorno  ║\n' +
      '╚══════════════════════════════════════════════════╝\n\n' +
      'Las siguientes variables de entorno son inválidas o faltan:\n\n' +
      errors +
      '\n\nRevisa tu archivo .env y reinicia la aplicación.\n'
    )
    throw new Error('Variables de entorno inválidas')
  }

  return parsed.data
}

export const env = validateEnv()
