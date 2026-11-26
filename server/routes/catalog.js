import { Router } from 'express'
import { Category, Product } from '../models/index.js'
import { requireStaff } from '../middleware/auth.js'
import { bilingual, fail, imageUrl, isObject, number } from '../utils/validate.js'
import { dropImage, objectId, outCategory, outProduct } from '../utils/helpers.js'

export const categories = Router()
export const products = Router()

/* ------------------------------ categories ------------------------------ */
const categoryBody = (b) => ({ name: bilingual(b?.name, { required: true }), image: imageUrl(b?.image) })

categories.get('/', async (_req, res) => {
  res.json((await Category.find().sort({ createdAt: 1 })).map(outCategory))
})

categories.post('/', requireStaff, async (req, res) => {
  res.status(201).json(outCategory(await Category.create(categoryBody(req.body))))
})

categories.put('/:id', requireStaff, async (req, res) => {
  const old = await Category.findById(objectId(req.params.id))
  if (!old) throw fail('err.notFound', 404)
  const next = categoryBody(req.body)
  const previousImage = old.image
  old.set(next)
  await old.save()
  if (previousImage && previousImage !== next.image) await dropImage(previousImage)
  res.json(outCategory(old))
})

categories.delete('/:id', requireStaff, async (req, res) => {
  const id = objectId(req.params.id)
  if (await Product.exists({ category: id })) throw fail('c.hasProducts', 409)
  const doc = await Category.findByIdAndDelete(id)
  if (doc) await dropImage(doc.image)
  res.json({ ok: true })
})

/* ------------------------------- products ------------------------------- */
async function productBody(b) {
  if (!isObject(b)) throw fail('err.invalid')
  const price = number(b.price, { key: 'err.number' })
  const oldPrice = b.oldPrice === null || b.oldPrice === '' || b.oldPrice === undefined ? null : number(b.oldPrice, { key: 'err.number' })
  if (oldPrice !== null && oldPrice < price) throw fail('err.oldPrice')
  const category = objectId(typeof b.categoryId === 'string' ? b.categoryId : '', 'err.category')
  if (!(await Category.exists({ _id: category }))) throw fail('err.category')
  return {
    name: bilingual(b.name, { required: true }),
    description: bilingual(b.description, { max: 3000 }),
    category, price, oldPrice,
    stock: number(b.stock, { integer: true, max: 1e6, key: 'err.number' }),
    available: b.available !== false,
    image: imageUrl(b.image),
  }
}

products.get('/', async (_req, res) => {
  res.json((await Product.find().sort({ createdAt: -1 })).map(outProduct))
})

products.get('/:id', async (req, res) => {
  const doc = await Product.findById(objectId(req.params.id))
  if (!doc) throw fail('err.notFound', 404)
  res.json(outProduct(doc))
})

products.post('/', requireStaff, async (req, res) => {
  res.status(201).json(outProduct(await Product.create(await productBody(req.body))))
})

products.put('/:id', requireStaff, async (req, res) => {
  const doc = await Product.findById(objectId(req.params.id))
  if (!doc) throw fail('err.notFound', 404)
  const next = await productBody(req.body)
  const previousImage = doc.image
  doc.set(next)
  await doc.save()
  if (previousImage && previousImage !== next.image) await dropImage(previousImage)
  res.json(outProduct(doc))
})

products.delete('/:id', requireStaff, async (req, res) => {
  const doc = await Product.findByIdAndDelete(objectId(req.params.id))
  if (doc) await dropImage(doc.image)
  res.json({ ok: true })
})

