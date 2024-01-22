import { pbkdf2, randomBytes } from 'crypto'
import { HashingService } from './hashing.service'

export class CryptoService implements HashingService {
  async hash(data: string, salt?: string) {
    salt ??= randomBytes(32).toString('hex')
    return new Promise<string>((resolve, reject) => {
      pbkdf2(data, salt!, 10000, 64, 'sha512', (err, derivedKey) => {
        if (err) {
          return reject(err)
        }
        const hash = derivedKey.toString('hex')
        const hashAndSalt = `${hash}.${salt}`
        resolve(hashAndSalt)
      })
    })
  }

  async compare(data: string, encrypted: string) {
    const salt = encrypted.split('.')[1]
    const hash = await this.hash(data, salt)
    return hash === encrypted
  }
}

export const cryptoService = new CryptoService()
