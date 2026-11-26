import 'dotenv/config'
import crypto from 'node:crypto'

const env = process.env
const isProd = env.NODE_ENV === 'production'
const bool = (v, fallback) => (v === undefined || v === '' ? fallback : ['1', 'true', 'yes'].includes(String(v).toLowerCase()))

let jwtSecret = env.JWT_SECRET
if (!jwtSecret || jwtSecret.length < 16 || jwtSecret.startsWith('change-me')) {
  if (isProd) {
    console.error('\n[config] JWT_SECRET is missing or too weak. Set a long random value in .env (see .env.example).\n')
    process.exit(1)
  }
  jwtSecret = crypto.randomBytes(32).toString('hex')
  console.warn('[config] JWT_SECRET not set: using a temporary one (logins reset when the server restarts).')
}

export const config = {
  isProd,
  port: Number(env.PORT) || 5000,
  mongoUri: env.MONGODB_URI || 'mongodb://127.0.0.1:27017/z2a',
  jwtSecret,
  // This email always becomes the Owner when it registers. If empty, the first account becomes the Owner.
  ownerEmail: (env.OWNER_EMAIL || '').trim().toLowerCase(),
  // Fill an empty database with demo categories/products on start (default: development only).
  seedDemo: bool(env.SEED_DEMO, !isProd),
  // Cookies are "Secure" (https only) in production. Set COOKIE_SECURE=false if you serve over plain http.
  cookieSecure: bool(env.COOKIE_SECURE, isProd),
  trustProxy: bool(env.TRUST_PROXY, false),
  allowedOrigins: (env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean),
  authRateLimit: Number(env.AUTH_RATE_LIMIT) || 30, // login/register attempts per 15 minutes per IP
}

export const ROLES = ['owner', 'admin', 'user']
export const STAFF = ['owner', 'admin']
export const ORDER_STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']
export const IMAGE_URL = /^\/api\/images\/[0-9a-f]{24}$/
