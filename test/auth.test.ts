import { bootstrap, startExpress } from '../src/server'
// .env //
import request from 'supertest'
import { afterAll, beforeEach, describe, expect, it } from 'vitest'
import { MONGO } from '../src/const/mongodb-key.const'
import { client } from '../src/db/db-config'
import { SignUp } from '../src/types/user.types'
import {
  E_ACCESS_TOKEN,
  E_REFRESH_TOKEN,
  NE_ACCESS_TOKEN,
  NE_REFRESH_TOKEN,
  fixtureUser,
  plainUser,
} from './test-data/auth.test-data'

const app = await bootstrap(startExpress)
const http = request(app)
const users = client.db(MONGO.DB_NAME).collection(MONGO.COLLECTIONS.USERS)

beforeEach(async () => {
  await users.drop()
  await users.insertOne(fixtureUser)
})

afterAll(async () => {
  await client.close(true)
})

describe('[FEATURE] auth - /auth', () => {
  describe('sign-up [POST /sign-up]', () => {
    it('responds with 201 on successfull sign-up', async () => {
      const email = 'new_user@mail.com'

      try {
        const response = await http.post('/auth/sign-up').send({
          email,
          password: 'newPassword090',
          name: 'New User',
        } as SignUp)

        expect(response.status).toBe(201)
      } finally {
        await users.deleteOne({ email })
      }
    })

    it('responds with 409 when user is already registered', async () => {
      const response = await http.post('/auth/sign-up').send(plainUser)

      expect(response.status).toBe(409)
    })

    it('responds with 400 on invalid sign-up input data', async () => {
      const response1 = await http.post('/auth/sign-up').send({
        email: 'email', // should fail
        password: 'newPassword090',
        name: 'New User',
      } as SignUp)

      const response2 = await http.post('/auth/sign-up').send({
        email: 'valid_email@mail.com',
        password: 'pwd', // should fail
        name: 'New User',
      } as SignUp)

      const response3 = await http.post('/auth/sign-up').send({
        email: 'valid_email@mail.com',
        password: 'newPassword090',
        name: 'U', // should fail
      } as SignUp)

      const response4 = await http.post('/auth/sign-up').send({
        email: 'email',
        password: 'pwd',
        name: 'U', // should fail
      } as SignUp)

      expect(response1.status).toBe(400)
      expect(response2.status).toBe(400)
      expect(response3.status).toBe(400)
      expect(response4.status).toBe(400)
    })
  })

  describe('sign-in [POST /sign-in]', () => {
    it('responds with 200 on successfull signs in', async () => {
      const response = await http.post('/auth/sign-in').send({
        email: plainUser.email,
        password: plainUser.password,
      })

      expect(response.statusCode).toBe(200)

      expect(response.body).toMatchObject({
        user: expect.any(Object),
        accessToken: expect.any(String),
      })
    })

    it('responds with 401 on invalid sign-in creds', async () => {
      const { status } = await http.post('/auth/sign-in').send({
        email: 'invalid@mail.com',
        password: 'invalid9090',
      })

      expect(status).toBe(401)
    })

    it('responds with 400 on sign-in creds validation fail', async () => {
      const { status } = await http.post('/auth/sign-in').send({
        email: 'invalid',
        password: 'invalid',
      })

      expect(status).toBe(400)
    })
  })

  describe('refresh [GET /refresh]', () => {
    it('responds with 200 and sends a new pair of refresh(cookie) and access(body) tokens', async () => {
      const res = await http
        .get('/auth/refresh')
        .set('Cookie', `refreshToken=${NE_REFRESH_TOKEN}`)
        .expect(200)

      expect(res.body).toMatchObject({
        user: expect.any(Object),
        accessToken: expect.any(String),
      })
      const cookies = res.headers['set-cookie'] as string[] | undefined

      const isRefreshToken = cookies?.find(cookie => cookie.includes('refreshToken'))
      expect(isRefreshToken).toBeDefined()
    })

    it('responds with 401 when refresh token is exposed/reused', async () => {
      await http.get('/auth/refresh').set('Cookie', `refreshToken=${NE_REFRESH_TOKEN}`).expect(200)

      await http.get('/auth/refresh').set('Cookie', `refreshToken=${NE_REFRESH_TOKEN}`).expect(401)
    })

    it('responds with 401 when refresh token is expired and clears response cookies', async () => {
      const res = await http
        .get('/auth/refresh')
        .set('Cookie', `refreshToken=${E_REFRESH_TOKEN}`)
        .expect(401)

      const cookies = res.headers['set-cookie'] as string[] | undefined

      const clearCookie = cookies?.find(cookie => cookie.includes('refreshToken=;'))
      expect(clearCookie).toBeDefined()
    })
  })

  describe('sign-out [POST /sign-out]', () => {
    it('responds with 200 and signs out', async () => {
      const response = await http
        .post('/auth/sign-out')
        .set('Authorization', `Bearer ${NE_ACCESS_TOKEN}`)
        .set('Cookie', `refreshToken=${NE_REFRESH_TOKEN}`)

      expect(response.statusCode).toBe(200)
    })

    it('responds with 401 when access token is not provided', async () => {
      const response = await http.post('/auth/sign-out')

      expect(response.statusCode).toBe(401)
    })

    it('responds with 401 when access token is expired', async () => {
      const response = await http
        .post('/auth/sign-out')
        .set('Authorization', `Bearer ${E_ACCESS_TOKEN}`)

      expect(response.statusCode).toBe(401)
    })

    it('responds with 401 when refresh token is not provided', async () => {
      const response = await http
        .post('/auth/sign-out')
        .set('Authorization', `Bearer ${NE_ACCESS_TOKEN}`)

      expect(response.statusCode).toBe(401)
    })
  })
})
