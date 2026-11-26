import mongoose from 'mongoose'
import { Category, Image, Product } from './models/index.js'

// Demo content (no photos yet: upload real photos from the admin dashboard).
const demoCategories = [
  ['watches', 'Watches', 'ساعات'],
  ['fragrances', 'Fragrances', 'عطور'],
  ['jewelry', 'Jewelry', 'مجوهرات'],
  ['bags', 'Bags', 'حقائب'],
  ['accessories', 'Accessories', 'إكسسوارات'],
  ['home', 'Home', 'المنزل'],
]

// [category, nameEn, nameAr, price, oldPrice, stock, descEn, descAr]
const demoProducts = [
  ['watches', 'Classic Steel Watch', 'ساعة ستانلس كلاسيكية', 2450, 3200, 12, 'A timeless stainless-steel watch with a clean dial and scratch-resistant glass.', 'ساعة ستانلس ستيل كلاسيكية بميناء أنيق وزجاج مقاوم للخدش.'],
  ['fragrances', 'Oud Signature Perfume', 'عطر عود سيجنتشر', 1350, 1800, 8, 'Warm oud with soft amber notes. Long-lasting, 100 ml.', 'عود دافئ مع لمسات العنبر. ثبات طويل، 100 مل.'],
  ['bags', 'Leather Tote Bag', 'حقيبة جلد توت', 1900, 2500, 5, 'Spacious genuine-leather tote for daily use.', 'حقيبة توت واسعة من الجلد الطبيعي للاستخدام اليومي.'],
  ['jewelry', 'Gold-Tone Ring', 'خاتم ذهبي اللون', 780, 1100, 20, 'Minimal gold-tone ring, tarnish resistant.', 'خاتم بسيط ذهبي اللون ومقاوم للتغيّر.'],
  ['accessories', 'Aviator Sunglasses', 'نظارة شمس أفياتور', 640, null, 15, 'Lightweight aviator frame with UV400 lenses.', 'إطار أفياتور خفيف وعدسات UV400.'],
  ['home', 'Scented Candle Set', 'طقم شموع معطرة', 420, 560, 0, 'Set of three hand-poured scented candles.', 'طقم من ثلاث شموع معطرة مصبوبة يدويًا.'],
  ['watches', 'Minimal Leather Watch', 'ساعة جلد مينيمال', 1650, null, 9, 'Slim case with a soft leather strap.', 'ساعة رفيعة بسوار جلد ناعم.'],
  ['bags', 'City Backpack', 'شنطة ظهر سيتي', 1200, 1500, 3, 'Water-resistant backpack with a padded laptop sleeve.', 'شنطة ظهر مقاومة للماء مع جيب مبطّن للابتوب.'],
]

export async function seedDemo({ force = false } = {}) {
  const has = (await Category.estimatedDocumentCount()) + (await Product.estimatedDocumentCount())
  if (has > 0 && !force) return false
  if (force) await Promise.all([Category.deleteMany({}), Product.deleteMany({}), Image.deleteMany({})])

  const created = {}
  const base = Date.now() - demoProducts.length * 3600_000
  for (const [key, en, ar] of demoCategories) created[key] = await Category.create({ name: { en, ar } })
  let i = 0
  for (const [cat, en, ar, price, oldPrice, stock, dEn, dAr] of demoProducts) {
    await Product.create({
      name: { en, ar }, description: { en: dEn, ar: dAr }, category: created[cat]._id,
      price, oldPrice, stock, available: true, createdAt: new Date(base + i++ * 3600_000),
    })
  }
  return true
}

// `npm run seed` (add --force to wipe products/categories first)
if (process.argv[1]?.endsWith('seed.js')) {
  const { connectDb } = await import('./db.js')
  await connectDb()
  const done = await seedDemo({ force: process.argv.includes('--force') })
  console.log(done ? '[seed] demo categories and products created' : '[seed] database already has data (use --force to replace it)')
  await mongoose.disconnect()
}
