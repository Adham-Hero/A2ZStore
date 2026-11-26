import { Router } from 'express'
import bcrypt from 'bcryptjs'
import rateLimit from 'express-rate-limit'
import { config } from '../config.js'
import { User } from '../models/index.js'
import { clearSession, setSession } from '../middleware/auth.js'
import { email, fail, str } from '../utils/validate.js'
import { outUser } from '../utils/helpers.js'

const router = Router()
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, limit: config.authRateLimit, standardHeaders: true, legacyHeaders: false,
  message: { error: 'err.rate' },
})
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 10) // keeps login timing similar for unknown emails

router.get('/me', (req, res) => res.json({ user: req.user ? outUser(req.user) : null }))

router.post('/register', limiter, async (req, res) => {
  const name = str(req.body?.name, { min: 1, max: 80, key: 'auth.invalidName' })
  const mail = email(req.body?.email)
  const password = str(req.body?.password, { min: 6, max: 72, key: 'auth.short' })

  if (await User.exists({ email: mail })) throw fail('auth.exists', 409)
  const isOwner = config.ownerEmail ? mail === config.ownerEmail : (await User.estimatedDocumentCount()) === 0
  const user = await User.create({ name, email: mail, passwordHash: await bcrypt.hash(password, 10), role: isOwner ? 'owner' : 'user' })

  setSession(res, user)
  res.status(201).json({ user: outUser(user), firstOwner: user.role === 'owner' })
})

router.post('/login', limiter, async (req, res) => {
  const mail = email(req.body?.email)
  const password = str(req.body?.password, { min: 1, max: 200, key: 'auth.invalid' })
  const user = await User.findOne({ email: mail })
  const ok = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH)
  if (!user || !ok) throw fail('auth.invalid', 401)
  setSession(res, user)
  res.json({ user: outUser(user) })
})

router.post('/logout', (_req, res) => {
  clearSession(res)
  res.json({ ok: true })
})

export default router
