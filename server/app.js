import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import express from 'express'
import helmet from 'helmet'
import { config } from './config.js'
import { dbReady } from './db.js'
import { loadUser } from './middleware/auth.js'
import { errorHandler, sameOrigin } from './middleware/security.js'
import auth from './routes/auth.js'
import admin from './routes/admin.js'
import { categories, products } from './routes/catalog.js'
import orders from './routes/orders.js'
import users from './routes/users.js'
import { images, uploads } from './routes/uploads.js'

const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist')

export function createApp() {
  const app = express()
  app.disable('x-powered-by')
  if (config.trustProxy) app.set('trust proxy', 1)

  app.use(helmet({
    hsts: config.cookieSecure,
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        'img-src': ["'self'", 'data:', 'blob:'],
        'upgrade-insecure-requests': config.cookieSecure ? [] : null, // never force https on plain-http setups
      },
    },
  }))
  app.use(compression())
  app.use(express.json({ limit: '100kb' }))
  app.use(cookieParser())
  app.use('/api', sameOrigin, loadUser)

  app.get('/api/health', (_req, res) => res.json({ ok: true, db: dbReady() }))
  app.use('/api/auth', auth)
  app.use('/api/categories', categories)
  app.use('/api/products', products)
  app.use('/api/orders', orders)
  app.use('/api/users', users)
  app.use('/api/uploads', uploads)
  app.use('/api/images', images)
  app.use('/api/admin', admin)
  app.use('/api', (_req, res) => res.status(404).json({ error: 'err.notFound' }))

  // Production: serve the built website (npm run build) and send every page to index.html
  if (fs.existsSync(path.join(dist, 'index.html'))) {
    app.use(express.static(dist, {
      index: false,
      setHeaders: (res, file) => {
        if (file.includes(`${path.sep}assets${path.sep}`)) res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
      },
    }))
    app.use((req, res, next) => {
      if (req.method !== 'GET') return next()
      res.sendFile(path.join(dist, 'index.html'))
    })
  }

  app.use(errorHandler)
  return app
}
