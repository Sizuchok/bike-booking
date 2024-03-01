import 'dotenv/config'
// -- .env --
import { z } from 'zod'

export const processEnvSchema = z.object({
  PORT: z.coerce.number(),
  SESSION_SECRET: z.string(),
  MONGO_DB_USER: z.string(),
  MONGO_DB_PASSWORD: z.string(),
  MONGO_DB_URL: z.string(),
  JWT_SECRET_KEY: z.string(),
  REFRESH_JWT_SECRET_KEY: z.string(),
  JWT_TTL: z.coerce.number(),
  REFRESH_JWT_TTL: z.coerce.number(),
  FRONT_END_URL: z.string(),
  NODE_ENV: z.enum(['prod', 'test', 'dev']).optional(),
  MONGO_DB_TEST_URL: z.string(),
})

export const dotEnv = processEnvSchema.parse(process.env)

process.dotEnv = dotEnv

console.log('Added new dotEnv property on global process object')
