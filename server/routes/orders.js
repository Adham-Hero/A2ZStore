import { Router } from 'express'
import { Counter, Order, Product } from '../models/index.js'
import { requireAuth, requireStaff } from '../middleware/auth.js'
import { ORDER_STATUSES } from '../config.js'
import { fail, isObject, number, oneOf, str } from '../utils/validate.js'
import { objectId, outOrder } from '../utils/helpers.js'

const router = Router()

function parseOrder(body) {
  if (!isObject(body) || !Array.isArray(body.items) || body.items.length === 0 || body.items.length > 50) throw fail('cart.empty')
  const merged = new Map()
  for (const it of body.items) {
    if (!isObject(it)) throw fail('err.invalid')
    const id = objectId(typeof it.productId === 'string' ? it.productId : '', 'err.stock')
    const qty = number(it.qty, { min: 1, max: 99, integer: true, key: 'err.invalid' })
    merged.set(id, (merged.get(id) ?? 0) + qty)
  }
  const c = isObject(body.customer) ? body.customer : {}
  const customer = {
    name: str(c.name, { min: 1, max: 100, key: 'err.invalid' }),
    phone: str(c.phone, { min: 5, max: 30, key: 'err.invalid' }),
    city: str(c.city, { min: 1, max: 80, key: 'err.invalid' }),
    address: str(c.address, { min: 3, max: 300, key: 'err.invalid' }),
    notes: c.notes === undefined || c.notes === '' ? '' : str(c.notes, { max: 500, key: 'err.invalid' }),
  }
  return { lines: [...merged].map(([productId, qty]) => ({ productId, qty })), customer }
}

// Create order: prices and stock are always taken from the database, never from the browser.
router.post('/', requireAuth, async (req, res) => {
  const { lines, customer } = parseOrder(req.body)
  const reserved = []
  const items = []
  try {
    for (const { productId, qty } of lines) {
      // atomic: only decrements when enough stock is left (safe when two people buy the last item)
      const p = await Product.findOneAndUpdate(
        { _id: productId, available: true, stock: { $gte: qty } },
        { $inc: { stock: -qty } },
        { returnDocument: 'after' },
      )
      if (!p) throw fail('err.stock', 409)
      reserved.push({ productId, qty })
      items.push({ product: p._id, name: p.name, price: p.price, qty })
    }
    const counter = await Counter.findOneAndUpdate({ _id: 'order' }, { $inc: { seq: 1 } }, { upsert: true, returnDocument: 'after' })
    const seq = 1000 + counter.seq
    const order = await Order.create({
      seq, number: `Z2A-${seq}`, user: req.user._id, customer, items,
      total: items.reduce((s, i) => s + i.price * i.qty, 0), payment: 'cod',
    })
    res.status(201).json({ order: outOrder(order) })
  } catch (err) {
    for (const r of reserved) await Product.updateOne({ _id: r.productId }, { $inc: { stock: r.qty } }) // give stock back
    throw err
  }
})

router.get('/mine', requireAuth, async (req, res) => {
  res.json((await Order.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(200)).map(outOrder))
})

router.get('/', requireStaff, async (_req, res) => {
  res.json((await Order.find().sort({ createdAt: -1 }).limit(500)).map(outOrder))
})

router.patch('/:id/status', requireStaff, async (req, res) => {
  const id = objectId(req.params.id)
  const status = oneOf(req.body?.status, ORDER_STATUSES)
  // the filter makes "cancel" happen only once, so stock is never returned twice
  const order = await Order.findOneAndUpdate({ _id: id, status: { $ne: 'cancelled' } }, { status }, { returnDocument: 'before' })
  if (!order) {
    if (await Order.exists({ _id: id })) throw fail('err.locked', 409)
    throw fail('err.notFound', 404)
  }
  if (status === 'cancelled') {
    for (const i of order.items) if (i.product) await Product.updateOne({ _id: i.product }, { $inc: { stock: i.qty } })
  }
  res.json(outOrder(await Order.findById(id)))
})

export default router
