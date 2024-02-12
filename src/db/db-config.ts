import { Express } from 'express'
import { MongoClient } from 'mongodb'

const url =
  process.dotEnv.NODE_ENV === 'test'
    ? process.dotEnv.MONGO_DB_TEST_URL
    : process.dotEnv.MONGO_DB_URL

export let client = new MongoClient(url)

export const bootstrap = async (startExpress: () => Express) => {
  try {
    await client.connect()
    console.log('Successfully connected to MongoDB')

    return startExpress()
  } catch (error) {
    if (error instanceof Error) {
      client.close()
    }

    throw error
  }
}
