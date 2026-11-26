import { createApp } from '../server/app.js'
import { connectDb } from '../server/db.js'
import { config } from '../server/config.js'
import { seedDemo } from '../server/seed.js'

// Keep the database connection warm between Vercel invocations where possible.
let dbPromise
let app
let seedPromise

async function prepare() {
  if (!dbPromise) dbPromise = connectDb()
  await dbPromise

  if (config.seedDemo && !seedPromise) {
    seedPromise = seedDemo().catch((error) => {
      seedPromise = undefined
      throw error
    })
  }
  if (config.seedDemo) await seedPromise

  if (!app) app = createApp()
}


export default async function handler(req, res) {
  try {
    await prepare()
    return app(req, res)
  } catch (error) {
    console.error('[vercel] API startup failed:', error?.message || error)
    return res.status(503).json({ error: 'err.server' })
  }
}
