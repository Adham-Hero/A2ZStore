import jwt from 'jsonwebtoken'
import { config, STAFF } from '../config.js'
import { User } from '../models/index.js'
import { fail } from '../utils/validate.js'

export const COOKIE = 'z2a_token'
const WEEK = 7 * 24 * 60 * 60 * 1000

export function setSession(res, user) {
  const token = jwt.sign({ sub: String(user._id) }, config.jwtSecret, { expiresIn: '7d' })
  res.cookie(COOKIE, token, { httpOnly: true, sameSite: 'lax', secure: config.cookieSecure, maxAge: WEEK, path: '/' })
}
export const clearSession = (res) => res.clearCookie(COOKIE, { httpOnly: true, sameSite: 'lax', secure: config.cookieSecure, path: '/' })

// Loads the user on every request, so role changes / deleted accounts apply immediately.
export async function loadUser(req, _res, next) {
  req.user = null
  const token = req.cookies?.[COOKIE]
  if (token) {
    try {
      const { sub } = jwt.verify(token, config.jwtSecret)
      req.user = await User.findById(sub)
    } catch {
      /* invalid or expired token -> treated as signed out */
    }
  }
  next()
}

export const requireAuth = (req, _res, next) => (req.user ? next() : next(fail('err.unauthorized', 401)))
export const requireRole = (...roles) => (req, _res, next) => {
  if (!req.user) return next(fail('err.unauthorized', 401))
  return roles.includes(req.user.role) ? next() : next(fail('err.denied', 403))
}
export const requireStaff = requireRole(...STAFF)
export const requireOwner = requireRole('owner')
