import { ObjectId } from 'mongodb'

export type MongoId = {
  _id: ObjectId
}

export type Id = {
  _id: string
}
