import { bootstrap, startExpress } from '../src/server'
// .env //
import request from 'supertest'
import { afterAll, beforeEach, describe } from 'vitest'
import { MONGO } from '../src/const/mongodb-key.const'
import { client } from '../src/db/db-config'
import { Bike, UpdateBike } from '../src/types/bike.types'
import { User } from '../src/types/user.types'
import { NE_ACCESS_TOKEN, userFixture } from './test-data/auth.test-data'
import { createBikeObj } from './test-data/bike.test-data'

const app = await bootstrap(startExpress)
const http = request(app)
const bikes = client.db(MONGO.DB_NAME).collection(MONGO.COLLECTIONS.BIKES)
const users = client.db(MONGO.DB_NAME).collection(MONGO.COLLECTIONS.USERS)

let tmpBike: Bike

beforeEach(async () => {
  await users.insertOne(userFixture)

  const response = await http
    .post('/bikes')
    .send(createBikeObj)
    .set('Authorization', `Bearer ${NE_ACCESS_TOKEN}`)
    .expect(201)

  tmpBike = response.body
})

afterEach(async () => {
  await bikes.drop()
  await users.drop()
})

afterAll(async () => {
  await client.close(true)
})

describe('[FEATURE] bikes = /bikes', () => {
  describe('create one bike [POST /bikes]', () => {
    it('responds with 401 status when auth header and token are not attached', async () => {
      await http.post('/bikes').expect(401)
    })

    it('responds with 400 status on invalid body data', async () => {
      await http.post('/bikes').set('Authorization', `Bearer ${NE_ACCESS_TOKEN}`).expect(400)
    })

    it('creates a new bike, reposponds with 201 status and returns bike object', async () => {
      const response = await http
        .post('/bikes')
        .send(createBikeObj)
        .set('Authorization', `Bearer ${NE_ACCESS_TOKEN}`)
        .expect(201)

      const createdBike = response.body

      expect(response.body).toMatchObject({
        _id: expect.any(String),
        ...createBikeObj,
      })

      const bikeOwner = (await users.findOne({ _id: userFixture._id })) as User | null
      expect(bikeOwner?.bikes).toBeDefined()
      expect(bikeOwner?.bikes?.some(bike => bike._id.toString() === createdBike._id)).toBe(true)
    })

    it('responds with 400 when create bike request body has "status" prop equal to "busy"', async () => {
      await http
        .post('/bikes')
        .send({ ...createBikeObj, status: 'busy' })
        .set('Authorization', `Bearer ${NE_ACCESS_TOKEN}`)
        .expect(400)
    })
  })

  describe('update one bike [PATCH /bikes/<id>]', () => {
    it('responds with 200 and updates bike status from "available" to "busy"', async () => {
      const updateBike: UpdateBike = {
        name: 'new bike name',
        status: 'busy',
        bookedById: userFixture._id.toString(),
        bookedByInfo: {
          email: userFixture.email,
          name: userFixture.name,
        },
      }

      const response = await http
        .patch(`/bikes/${tmpBike._id.toString()}`)
        .send(updateBike)
        .set('Authorization', `Bearer ${NE_ACCESS_TOKEN}`)
        .expect(200)

      expect(response.body).toMatchObject({
        _id: expect.any(String),
        ...updateBike,
        ownerId: expect.any(String),
        ownerInfo: {
          email: userFixture.email,
          name: userFixture.name,
        },
        bookedById: userFixture._id.toString(),
        status: 'busy',
      } as Bike)

      const bookedByUser = (await users.findOne({ _id: userFixture._id })) as User | null

      expect(bookedByUser?.booked).toBeInstanceOf(Array)
      expect(bookedByUser?.booked?.[0]?.status).toEqual('busy')

      const bikeOwner = (await users.findOne({ _id: userFixture._id })) as User | null

      expect(bikeOwner?.booked).toBeInstanceOf(Array)
      expect(bikeOwner?.booked?.[0]?.status).toEqual('busy')
    })

    it('responds with 400 status when trying to book bike with status "busy"', async () => {
      const updateBike: UpdateBike = {
        status: 'busy',
        bookedById: userFixture._id.toString(),
        bookedByInfo: {
          email: userFixture.email,
          name: userFixture.name,
        },
      }

      await http
        .patch(`/bikes/${tmpBike._id.toString()}`)
        .send(updateBike)
        .set('Authorization', `Bearer ${NE_ACCESS_TOKEN}`)
        .expect(200)

      await http
        .patch(`/bikes/${tmpBike._id.toString()}`)
        .send(updateBike)
        .set('Authorization', `Bearer ${NE_ACCESS_TOKEN}`)
        .expect(400)
    })

    it('responds with 400 when trying to update bike status to "available" when it is already "available"', async () => {
      const updateBike: UpdateBike = {
        status: 'available',
        bookedById: null,
        bookedByInfo: null,
      }

      await http
        .patch(`/bikes/${tmpBike._id.toString()}`)
        .send(updateBike)
        .set('Authorization', `Bearer ${NE_ACCESS_TOKEN}`)
        .expect(400)
    })

    it('responds with 200 when trying to update bike status to "unavailable" from status "available"', async () => {
      const updateBike: UpdateBike = {
        status: 'unavailable',
        bookedById: null,
        bookedByInfo: null,
      }

      const res = await http
        .patch(`/bikes/${tmpBike._id.toString()}`)
        .send(updateBike)
        .set('Authorization', `Bearer ${NE_ACCESS_TOKEN}`)

      expect(res.status).toBe(200)
    })
  })
})
