import { z } from 'zod'
import { processEnvSchema } from '../../config/dot-env-config'

export type DotEnv = z.infer<typeof processEnvSchema>

declare global {
  namespace NodeJS {
    interface Process {
      dotEnv: DotEnv
    }
  }
}
