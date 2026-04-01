import 'dotenv/config'
import { defineConfig, env } from '@prisma/config'

export default defineConfig({
  // Para Prisma 6 al hacer db push sin url en el schema, se requiere definirlo aquí:
  datasource: {
    url: env('DATABASE_URL')
  }
})
