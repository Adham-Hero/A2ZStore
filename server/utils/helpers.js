import mongoose from 'mongoose'
import { Image } from '../models/index.js'
import { IMAGE_URL } from '../config.js'
import { fail } from './validate.js'

export const objectId = (v, key = 'err.notFound') => {
  if (typeof v !== 'string' || !mongoose.isValidObjectId(v) || !/^[0-9a-f]{24}$/i.test(v)) throw fail(key, 404)
  return v
}

// Remove an uploaded image when nothing uses it any more (best effort).
export async function dropImage(url) {
  if (typeof url !== 'string' || !IMAGE_URL.test(url)) return
  await Image.deleteOne({ _id: url.split('/').pop() }).catch(() => {})
}

/* ---------- JSON shapes sent to the website ---------- */
export const outUser = (u) => ({ id: String(u._id), name: u.name, email: u.email, role: u.role, createdAt: u.createdAt })

export const outCategory = (c) => ({ id: String(c._id), name: c.name, image: c.image || '', createdAt: c.createdAt })

export const outProduct = (p) => ({
  id: String(p._id), name: p.name, description: p.description, categoryId: String(p.category),
  price: p.price, oldPrice: p.oldPrice ?? null, stock: p.stock, available: p.available,
  image: p.image || '', createdAt: p.createdAt,
})

export const outOrder = (o) => ({
  id: String(o._id), seq: o.seq, number: o.number, userId: String(o.user), customer: o.customer,
  items: o.items.map((i) => ({ productId: i.product ? String(i.product) : null, name: i.name, price: i.price, qty: i.qty })),
  total: o.total, payment: o.payment, status: o.status, createdAt: o.createdAt,
})
