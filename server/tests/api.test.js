// Integration tests for the API. They need a MongoDB:  npm test
// (uses TEST_MONGODB_URI, default mongodb://127.0.0.1:27017/z2a_test - the database is wiped first!)
import assert from 'node:assert/strict'
import { after, before, describe, it } from 'node:test'
import mongoose from 'mongoose'

process.env.MONGODB_URI = process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017/z2a_test'
process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'test-secret-test-secret-test-secret'
process.env.AUTH_RATE_LIMIT = '1000'
process.env.OWNER_EMAIL = ''

const { createApp } = await import('../app.js')
const { connectDb } = await import('../db.js')

let server, base
class Client {
  cookie = ''
  async call(method, path, body, { raw } = {}) {
    const headers = { Origin: base }
    let payload
    if (raw) payload = raw
    else if (body !== undefined) { headers['Content-Type'] = 'application/json'; payload = JSON.stringify(body) }
    if (this.cookie) headers.Cookie = this.cookie
    const res = await fetch(base + path, { method, headers, body: payload })
    const set = res.headers.getSetCookie?.() ?? []
    for (const c of set) this.cookie = c.startsWith('z2a_token=;') || /Expires=Thu, 01 Jan 1970/.test(c) ? '' : c.split(';')[0]
    const ct = res.headers.get('content-type') || ''
    const data = ct.includes('json') ? await res.json() : await res.arrayBuffer()
    return { status: res.status, data, headers: res.headers }
  }
}
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64')
const form = (buf, type = 'image/png', name = 'a.png') => {
  const f = new FormData()
  f.append('file', new Blob([buf], { type }), name)
  return f
}

before(async () => {
  await connectDb()
  await mongoose.connection.dropDatabase()
  await new Promise((r) => { server = createApp().listen(0, r) })
  base = `http://127.0.0.1:${server.address().port}`
})
after(async () => {
  server.close()
  await mongoose.connection.dropDatabase()
  await mongoose.disconnect()
})

const owner = new Client(), admin = new Client(), shopper = new Client(), guest = new Client()
let cat, product, order

describe('auth & roles', () => {
  it('first account is the owner, next ones are users', async () => {
    const r = await owner.call('POST', '/api/auth/register', { name: 'Owner', email: 'Owner@Test.com', password: 'secret1' })
    assert.equal(r.status, 201)
    assert.equal(r.data.user.role, 'owner')
    assert.equal(r.data.user.email, 'owner@test.com')
    assert.equal(r.data.user.passwordHash, undefined)
    assert.equal((await admin.call('POST', '/api/auth/register', { name: 'Ann', email: 'ann@test.com', password: 'secret1' })).data.user.role, 'user')
    assert.equal((await shopper.call('POST', '/api/auth/register', { name: 'Sam', email: 'sam@test.com', password: 'secret1' })).data.user.role, 'user')
  })
  it('rejects duplicate email, short password, wrong password, operator injection', async () => {
    assert.equal((await guest.call('POST', '/api/auth/register', { name: 'x', email: 'sam@test.com', password: 'secret1' })).data.error, 'auth.exists')
    assert.equal((await guest.call('POST', '/api/auth/register', { name: 'x', email: 'n@test.com', password: '123' })).data.error, 'auth.short')
    assert.equal((await guest.call('POST', '/api/auth/login', { email: 'sam@test.com', password: 'nope' })).status, 401)
    assert.equal((await guest.call('POST', '/api/auth/login', { email: { $gt: '' }, password: { $gt: '' } })).status, 400)
  })
  it('/me returns the session and logout clears it', async () => {
    assert.equal((await owner.call('GET', '/api/auth/me')).data.user.name, 'Owner')
    assert.equal((await guest.call('GET', '/api/auth/me')).data.user, null)
    const tmp = new Client()
    await tmp.call('POST', '/api/auth/login', { email: 'sam@test.com', password: 'secret1' })
    assert.equal((await tmp.call('GET', '/api/auth/me')).data.user.email, 'sam@test.com')
    await tmp.call('POST', '/api/auth/logout')
    assert.equal((await tmp.call('GET', '/api/auth/me')).data.user, null)
  })
  it('only the owner changes roles; promoted admin can manage the catalog', async () => {
    const users = (await owner.call('GET', '/api/users')).data
    const ann = users.find((u) => u.email === 'ann@test.com')
    assert.equal((await shopper.call('GET', '/api/users')).status, 403)
    assert.equal((await guest.call('GET', '/api/users')).status, 401)
    assert.equal((await shopper.call('PATCH', `/api/users/${ann.id}/role`, { role: 'owner' })).status, 403)
    assert.equal((await owner.call('PATCH', `/api/users/${ann.id}/role`, { role: 'superuser' })).status, 400)
    assert.equal((await owner.call('PATCH', `/api/users/${ann.id}/role`, { role: 'admin' })).data.role, 'admin')
    const me = users.find((u) => u.email === 'owner@test.com')
    assert.equal((await owner.call('PATCH', `/api/users/${me.id}/role`, { role: 'user' })).status, 403)
    assert.equal((await admin.call('PATCH', `/api/users/${ann.id}/role`, { role: 'user' })).status, 403)
    assert.equal((await admin.call('GET', '/api/users')).status, 200)
  })
})

describe('catalog', () => {
  it('blocks writes for non-staff, allows staff', async () => {
    assert.equal((await shopper.call('POST', '/api/categories', { name: { en: 'X' } })).status, 403)
    assert.equal((await guest.call('POST', '/api/categories', { name: { en: 'X' } })).status, 401)
    cat = (await admin.call('POST', '/api/categories', { name: { en: 'Scarves', ar: 'أوشحة' } })).data
    assert.equal(cat.name.ar, 'أوشحة')
    assert.equal((await admin.call('POST', '/api/categories', { name: { en: '' } })).data.error, 'err.name')
  })
  it('uploads a real image, refuses fake/svg images, serves it publicly', async () => {
    const ok = await admin.call('POST', '/api/uploads', undefined, { raw: form(PNG) })
    assert.equal(ok.status, 201)
    assert.match(ok.data.url, /^\/api\/images\/[0-9a-f]{24}$/)
    const img = await guest.call('GET', ok.data.url)
    assert.equal(img.status, 200)
    assert.equal(img.headers.get('content-type'), 'image/png')
    assert.match(img.headers.get('cache-control'), /immutable/)
    assert.equal((await admin.call('POST', '/api/uploads', undefined, { raw: form(Buffer.from('<svg onload=alert(1)></svg>'), 'image/png', 'x.png') })).data.error, 'err.image')
    assert.equal((await shopper.call('POST', '/api/uploads', undefined, { raw: form(PNG) })).status, 403)
    // photo on a category
    cat = (await admin.call('PUT', `/api/categories/${cat.id}`, { name: cat.name, image: ok.data.url })).data
    assert.equal(cat.image, ok.data.url)
    assert.equal((await admin.call('PUT', `/api/categories/${cat.id}`, { name: cat.name, image: 'https://evil.example/x.png' })).data.error, 'err.image')
  })
  it('validates and saves products (photo, prices, stock)', async () => {
    const photo = (await admin.call('POST', '/api/uploads', undefined, { raw: form(PNG) })).data.url
    const body = { name: { en: 'Silk Scarf', ar: 'وشاح حرير' }, description: { en: 'Soft', ar: 'ناعم' }, categoryId: cat.id, price: 300, oldPrice: 400, stock: 3, available: true, image: photo }
    assert.equal((await admin.call('POST', '/api/products', { ...body, oldPrice: 100 })).data.error, 'err.oldPrice')
    assert.equal((await admin.call('POST', '/api/products', { ...body, stock: 1.5 })).data.error, 'err.number')
    assert.equal((await admin.call('POST', '/api/products', { ...body, categoryId: '000000000000000000000000' })).data.error, 'err.category')
    assert.equal((await shopper.call('POST', '/api/products', body)).status, 403)
    const r = await admin.call('POST', '/api/products', body)
    assert.equal(r.status, 201)
    product = r.data
    assert.equal(product.image, photo)
    assert.equal(product.categoryId, cat.id)
    assert.ok((await guest.call('GET', '/api/products')).data.some((p) => p.id === product.id))
    assert.equal((await guest.call('GET', `/api/products/${product.id}`)).data.name.en, 'Silk Scarf')
    assert.equal((await guest.call('GET', '/api/products/not-an-id')).status, 404)
  })
  it('replacing a photo deletes the old image', async () => {
    const old = product.image
    const fresh = (await admin.call('POST', '/api/uploads', undefined, { raw: form(PNG) })).data.url
    const r = await admin.call('PUT', `/api/products/${product.id}`, { ...product, categoryId: product.categoryId, image: fresh })
    assert.equal(r.data.image, fresh)
    assert.equal((await guest.call('GET', old)).status, 404)
    product = r.data
  })
  it('does not delete a category that still has products', async () => {
    assert.equal((await admin.call('DELETE', `/api/categories/${cat.id}`)).data.error, 'c.hasProducts')
  })
})

describe('orders', () => {
  const customer = { name: 'Sam', phone: '01000000000', city: 'Cairo', address: '12 Tahrir St', notes: '' }
  it('needs sign in, validates input, ignores prices sent by the browser', async () => {
    assert.equal((await guest.call('POST', '/api/orders', { items: [{ productId: product.id, qty: 1 }], customer })).status, 401)
    assert.equal((await shopper.call('POST', '/api/orders', { items: [], customer })).data.error, 'cart.empty')
    assert.equal((await shopper.call('POST', '/api/orders', { items: [{ productId: product.id, qty: 1 }], customer: { ...customer, phone: '' } })).data.error, 'err.invalid')
    const r = await shopper.call('POST', '/api/orders', { items: [{ productId: product.id, qty: 2, price: 1 }], customer, total: 1 })
    assert.equal(r.status, 201)
    order = r.data.order
    assert.equal(order.total, 600)
    assert.equal(order.number, 'Z2A-1001')
    assert.equal(order.status, 'pending')
    assert.equal((await guest.call('GET', `/api/products/${product.id}`)).data.stock, 1)
  })
  it('never oversells', async () => {
    const r = await shopper.call('POST', '/api/orders', { items: [{ productId: product.id, qty: 2 }], customer })
    assert.equal(r.status, 409)
    assert.equal(r.data.error, 'err.stock')
    assert.equal((await guest.call('GET', `/api/products/${product.id}`)).data.stock, 1)
  })
  it('two buyers racing for the last item: exactly one wins', async () => {
    const results = await Promise.all([
      shopper.call('POST', '/api/orders', { items: [{ productId: product.id, qty: 1 }], customer }),
      owner.call('POST', '/api/orders', { items: [{ productId: product.id, qty: 1 }], customer }),
    ])
    assert.deepEqual(results.map((r) => r.status).sort(), [201, 409])
    assert.equal((await guest.call('GET', `/api/products/${product.id}`)).data.stock, 0)
  })
  it('users see only their orders; staff see all', async () => {
    const mine = (await shopper.call('GET', '/api/orders/mine')).data
    assert.ok(mine.length >= 1 && mine.every((o) => o.userId === mine[0].userId))
    assert.equal((await shopper.call('GET', '/api/orders')).status, 403)
    assert.ok((await admin.call('GET', '/api/orders')).data.length >= 2)
  })
  it('status changes; cancelling returns stock once and locks the order', async () => {
    assert.equal((await shopper.call('PATCH', `/api/orders/${order.id}/status`, { status: 'shipped' })).status, 403)
    assert.equal((await admin.call('PATCH', `/api/orders/${order.id}/status`, { status: 'nonsense' })).status, 400)
    assert.equal((await admin.call('PATCH', `/api/orders/${order.id}/status`, { status: 'confirmed' })).data.status, 'confirmed')
    assert.equal((await admin.call('PATCH', `/api/orders/${order.id}/status`, { status: 'cancelled' })).data.status, 'cancelled')
    assert.equal((await guest.call('GET', `/api/products/${product.id}`)).data.stock, 2)
    const again = await admin.call('PATCH', `/api/orders/${order.id}/status`, { status: 'cancelled' })
    assert.equal(again.status, 409)
    assert.equal((await guest.call('GET', `/api/products/${product.id}`)).data.stock, 2)
    assert.equal((await admin.call('PATCH', `/api/orders/${order.id}/status`, { status: 'pending' })).data.error, 'err.locked')
  })
})

describe('owner tools & security', () => {
  it('rejects cross-site write requests', async () => {
    const res = await fetch(`${base}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://evil.example' }, body: '{}' })
    assert.equal(res.status, 403)
  })
  it('sets httpOnly cookies and security headers', async () => {
    const res = await fetch(`${base}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'sam@test.com', password: 'secret1' }) })
    assert.match(res.headers.get('set-cookie'), /HttpOnly/i)
    assert.match(res.headers.get('set-cookie'), /SameSite=Lax/i)
    assert.equal(res.headers.get('x-content-type-options'), 'nosniff')
    assert.equal(res.headers.get('x-powered-by'), null)
  })
  it('owner can reset demo data and delete users; admin cannot', async () => {
    assert.equal((await admin.call('POST', '/api/admin/reset-demo')).status, 403)
    assert.equal((await owner.call('POST', '/api/admin/reset-demo')).status, 200)
    assert.equal((await guest.call('GET', '/api/categories')).data.length, 6)
    assert.equal((await guest.call('GET', '/api/products')).data.length, 8)
    const sam = (await owner.call('GET', '/api/users')).data.find((u) => u.email === 'sam@test.com')
    assert.equal((await admin.call('DELETE', `/api/users/${sam.id}`)).status, 403)
    assert.equal((await owner.call('DELETE', `/api/users/${sam.id}`)).status, 200)
    assert.equal((await shopper.call('GET', '/api/auth/me')).data.user, null)
  })
  it('health endpoint', async () => {
    assert.deepEqual((await guest.call('GET', '/api/health')).data, { ok: true, db: true })
  })
})
