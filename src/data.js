// Seed data (first run only) + constants. Everything here can be edited from the admin dashboard.
export const ROLES = ['owner', 'admin', 'user']
export const ORDER_STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']
export const LOW_STOCK = 5

export const contactInfo = {
  phone: '+20 100 000 0000',
  email: 'info@z2a.com',
}

export const seedCategories = [
  { id: 'watches', icon: '⌚', name: { en: 'Watches', ar: 'ساعات' } },
  { id: 'fragrances', icon: '🧴', name: { en: 'Fragrances', ar: 'عطور' } },
  { id: 'jewelry', icon: '💍', name: { en: 'Jewelry', ar: 'مجوهرات' } },
  { id: 'bags', icon: '👜', name: { en: 'Bags', ar: 'حقائب' } },
  { id: 'accessories', icon: '🕶️', name: { en: 'Accessories', ar: 'إكسسوارات' } },
  { id: 'home', icon: '🕯️', name: { en: 'Home', ar: 'المنزل' } },
]

const p = (id, categoryId, icon, en, ar, price, oldPrice, stock, day, dEn, dAr) => ({
  id, categoryId, icon, image: null, available: true, price, oldPrice, stock,
  name: { en, ar },
  description: { en: dEn, ar: dAr },
  createdAt: `2026-11-${day}T10:00:00.000Z`,
})

export const seedProducts = [
  p('p1', 'watches', '⌚', 'Classic Steel Watch', 'ساعة ستانلس كلاسيكية', 2450, 3200, 12, '20',
    'A timeless stainless-steel watch with a clean dial and sapphire-style glass.',
    'ساعة ستانلس ستيل كلاسيكية بميناء أنيق وزجاج مقاوم للخدش.'),
  p('p2', 'fragrances', '🧴', 'Oud Signature Perfume', 'عطر عود سيجنتشر', 1350, 1800, 8, '21',
    'Warm oud with soft amber notes. Long-lasting, 100 ml.',
    'عود دافئ مع لمسات العنبر. ثبات طويل، 100 مل.'),
  p('p3', 'bags', '👜', 'Leather Tote Bag', 'حقيبة جلد توت', 1900, 2500, 5, '22',
    'Spacious genuine-leather tote for daily use.',
    'حقيبة توت واسعة من الجلد الطبيعي للاستخدام اليومي.'),
  p('p4', 'jewelry', '💍', 'Gold-Tone Ring', 'خاتم ذهبي اللون', 780, 1100, 20, '23',
    'Minimal gold-tone ring, tarnish resistant.',
    'خاتم بسيط ذهبي اللون ومقاوم للتغيّر.'),
  p('p5', 'accessories', '🕶️', 'Aviator Sunglasses', 'نظارة شمس أفياتور', 640, null, 15, '18',
    'Lightweight aviator frame with UV400 lenses.',
    'إطار أفياتور خفيف وعدسات UV400.'),
  p('p6', 'home', '🕯️', 'Scented Candle Set', 'طقم شموع معطرة', 420, 560, 0, '17',
    'Set of three hand-poured scented candles.',
    'طقم من ثلاث شموع معطرة مصبوبة يدويًا.'),
  p('p7', 'watches', '⌚', 'Minimal Leather Watch', 'ساعة جلد مينيمال', 1650, null, 9, '16',
    'Slim case with a soft leather strap.',
    'ساعة رفيعة بسوار جلد ناعم.'),
  p('p8', 'bags', '🎒', 'City Backpack', 'شنطة ظهر سيتي', 1200, 1500, 3, '15',
    'Water-resistant backpack with a padded laptop sleeve.',
    'شنطة ظهر مقاومة للماء مع جيب مبطّن للابتوب.'),
]
