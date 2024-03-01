import { ObjectId } from 'mongodb'
import { Bike, CreateBike } from '../../src/types/bike.types'
import { userFixture } from './auth.test-data'

export const bikeFixture = {
  _id: new ObjectId(),
  name: 'BMX',
  type: 'BMX type',
  color: 'Purple',
  wheelSize: 54,
  price: 5500,
  description: 'Cool bike no cap.',
  status: 'available',
  ownerId: userFixture._id.toString(),
  ownerInfo: {
    email: userFixture.email,
    name: userFixture.name,
  },
} as Bike

export const createBikeObj = {
  name: 'BMX',
  type: 'BMX type',
  color: 'Purple',
  wheelSize: 54,
  price: 5500,
  description: 'Cool bike no cap.',
  status: 'available',
  ownerId: userFixture._id.toString(),
  ownerInfo: {
    email: userFixture.email,
    name: userFixture.name,
  },
} as CreateBike
