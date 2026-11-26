import { IMAGE_URL } from '../config.js'

// Errors carry an i18n key (the website translates it) and an HTTP status.
export const fail = (key = 'err.invalid', status = 400) => Object.assign(new Error(key), { key, status })

const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v)

export function str(v, { min = 0, max = 500, key = 'err.invalid' } = {}) {
  if (typeof v !== 'string') throw fail(key) // blocks NoSQL operator objects such as {"$gt": ""}
  const s = v.trim()
  if (s.length < min || s.length > max) throw fail(key)
  return s
}

export function email(v) {
  const s = str(v, { min: 3, max: 200, key: 'auth.invalidEmail' }).toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)) throw fail('auth.invalidEmail')
  return s
}

export function bilingual(v, { required = false, max = 200, key = 'err.name' } = {}) {
  const o = isObj(v) ? v : {}
  const en = typeof o.en === 'string' ? o.en.trim() : ''
  const ar = typeof o.ar === 'string' ? o.ar.trim() : ''
  if (required && !en) throw fail(key)
  if (en.length > max || ar.length > max) throw fail(key)
  return { en, ar }
}

export function imageUrl(v) {
  if (v === undefined || v === null || v === '') return ''
  if (typeof v !== 'string' || !IMAGE_URL.test(v)) throw fail('err.image')
  return v
}

export function number(v, { min = 0, max = 1e9, integer = false, key = 'err.number' } = {}) {
  const n = typeof v === 'number' ? v : typeof v === 'string' && v.trim() !== '' ? Number(v) : NaN
  if (!Number.isFinite(n) || n < min || n > max || (integer && !Number.isInteger(n))) throw fail(key)
  return n
}

export const oneOf = (v, list, key = 'err.invalid') => {
  if (typeof v !== 'string' || !list.includes(v)) throw fail(key)
  return v
}

export const isObject = isObj
