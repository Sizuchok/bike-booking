import base64url from 'base64url'
import { createHmac } from 'crypto'

type JwtHeader = {
  alg: 'HS256'
  typ: 'JWT'
}

export type FullPayload = {
  iat: number
  sub: number | string
  exp: number
}

type Payload = Pick<FullPayload, 'sub'> & {
  ttl: number
}

export class JwtService {
  constructor(private secretKey: string) {}

  issue = (payload: Payload, refreshSecret?: string) => {
    const header: JwtHeader = {
      alg: 'HS256',
      typ: 'JWT',
    }

    const now = Date.now() / 1000

    const payloadFull: FullPayload = {
      iat: now,
      exp: now + payload.ttl,
      sub: payload.sub,
    }

    const bs64Header = base64url(JSON.stringify(header))
    const bs64Payload = base64url(JSON.stringify(payloadFull))

    const bs64JwtSignature = createHmac('sha256', refreshSecret ?? this.secretKey)
      .update(`${bs64Header}.${bs64Payload}`)
      .digest('base64url')

    return `${bs64Header}.${bs64Payload}.${bs64JwtSignature}`
  }

  verify = (jwt: string, refreshSecret?: string) => {
    const [header, payload, signature] = jwt.split('.')

    if (!header || !payload || !signature) {
      throw new Error('Invalid jwt format')
    }

    const payloadStr = base64url.decode(payload)
    const headerStr = base64url.decode(header)

    try {
      JSON.parse(headerStr)
      const jsonPayload: FullPayload = JSON.parse(payloadStr)

      const { exp } = jsonPayload

      const recreatedSignature = createHmac('sha256', refreshSecret ?? this.secretKey)
        .update(`${header}.${payload}`)
        .digest('base64url')

      const isEqual = signature === recreatedSignature

      if (!isEqual) {
        throw new Error('Jwt not verified')
      }

      if (exp && exp < Date.now() / 1000) {
        throw new Error('Jwt expired')
      }

      return jsonPayload
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error('Invalid json format of jwt header or payload')
      }

      throw error
    }
  }
}
