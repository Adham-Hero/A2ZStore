import mongoose from 'mongoose'
import { config } from './config.js'

export async function connectDb() {
  mongoose.set('strictQuery', true)
  try {
    await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 6000 })
  } catch (err) {
    console.error(`\n[db] Could not connect to MongoDB at ${config.mongoUri.replace(/\/\/[^@]*@/, '//***@')}`)
    console.error(`[db] ${err.message}`)
    console.error('[db] Start MongoDB (or run "docker compose up -d mongo") and check MONGODB_URI in .env\n')
    throw err
  }
  console.log(`[db] connected to "${mongoose.connection.name}"`)
}

export const dbReady = () => mongoose.connection.readyState === 1
