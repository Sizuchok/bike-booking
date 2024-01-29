import 'dotenv/config'
import { z } from 'zod'

const processEnvSchema = z.object({
  PORT: z.string(),
  SESSION_SECRET: z.string(),
  MONGO_DB_USER: z.string(),
  MONGO_DB_PASSWORD: z.string(),
  MONGO_DB_URL: z.string(),
  JWT_SECRET_KEY: z.string(),
  REFRESH_JWT_SECRET_KEY: z.string(),
  JWT_TTL: z.string(),
  REFRESH_JWT_TTL: z.string(),
})

export const dotEnv = processEnvSchema.parse(process.env)

console.log('The process.env successfully populated with .env file values')

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof processEnvSchema> {}
  }
}
