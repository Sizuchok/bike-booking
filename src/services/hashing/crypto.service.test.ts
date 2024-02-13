import { CryptoService } from './crypto.service'

const cryptoService = new CryptoService()

describe('crypto service', () => {
  const password = 'Password123'

  it('returns hashed string value in format: <hashed_value>.<salt>', async () => {
    const hashed = await cryptoService.hash(password)
    expect(hashed.split('.').length).toBe(2)
  })

  it('returns true on successfull hash comparison', async () => {
    const hash = await cryptoService.hash(password)
    const isValid = await cryptoService.compare(password, hash)
    expect(isValid).toBeTruthy()
  })

  it('returns false input data hash is not equal to provided hash', async () => {
    const hash = await cryptoService.hash('wrong_password')
    const isValid = await cryptoService.compare('some_other_password', hash)
    expect(isValid).toBeFalsy()
  })
})
