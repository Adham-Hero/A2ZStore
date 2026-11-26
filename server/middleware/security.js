import { config } from '../config.js'
import { fail } from '../utils/validate.js'

// Extra CSRF protection on top of SameSite cookies: a browser request that changes data must come from our own site.
export function sameOrigin(req, _res, next) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next()
  const origin = req.get('origin')
  if (!origin) return next() // non-browser clients (curl, tests)
  try {
    const host = new URL(origin).host
    if (host === req.get('host') || config.allowedOrigins.includes(origin)) return next()
  } catch {
    /* fall through */
  }
  return next(fail('err.denied', 403))
}

// Express recognises error handlers by their 4 arguments, so _next must stay.
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, _next) {
  if (err.key) return res.status(err.status || 400).json({ error: err.key })
  if (err.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ error: 'err.imageSize' })
  if (err.type === 'entity.parse.failed' || err.type === 'entity.too.large') return res.status(400).json({ error: 'err.invalid' })
  if (err.code === 11000) return res.status(409).json({ error: err.keyPattern?.email ? 'auth.exists' : 'err.invalid' })
  if (err.name === 'CastError' || err.name === 'ValidationError') return res.status(400).json({ error: 'err.invalid' })
  console.error(`[error] ${req.method} ${req.originalUrl}`, err)
  res.status(500).json({ error: 'err.server' })
}
