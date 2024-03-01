import { Collection } from 'mongodb'
import { MONGO } from '../const/mongodb-key.const'
import { BikeForMongo } from '../types/bike.types'
import { UserForMongo } from '../types/user.types'
import { client } from './db-config'

const db = client.db(MONGO.DB_NAME)

export const userCollection = db.collection(MONGO.COLLECTIONS.USERS) as Collection<UserForMongo>

export const bikeCollection = db.collection(MONGO.COLLECTIONS.BIKES) as Collection<BikeForMongo>
