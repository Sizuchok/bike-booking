import { z } from 'zod'
import { processEnvSchema } from '../../config/dot-env-config'

declare global {
  namespace NodeJS {
    type DotEnv = z.infer<typeof processEnvSchema>
    interface Process {
      dotEnv: DotEnv
    }
  }
}
