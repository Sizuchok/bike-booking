import { MongoClient } from 'mongodb'

const url = process.env.MONGO_DB_URL!

export const client = new MongoClient(url)

export const bootstrap = async (startExpress: () => void) => {
  try {
    await client.connect()
    console.log('Successfully connected to MongoDB')

    startExpress()
  } catch (error) {
    if (error instanceof Error) {
      client.close()
      return console.error(error.message)
    }

    console.error('Unknown error occured.')
  }
}
