import mongoose from 'mongoose'
import { createApp } from './app.js'
import { config } from './config.js'
import { connectDb } from './db.js'
import { seedDemo } from './seed.js'

try {
  await connectDb()
} catch {
  process.exit(1)
}

if (config.seedDemo && (await seedDemo())) console.log('[seed] empty database: demo categories and products created')

const app = createApp()
const server = app.listen(config.port, () => {
  console.log(`[server] Z2A running on http://localhost:${config.port}  (${config.isProd ? 'production' : 'development'})`)
})

const stop = async () => {
  server.close()
  await mongoose.disconnect()
  process.exit(0)
}
process.on('SIGINT', stop)
process.on('SIGTERM', stop)
