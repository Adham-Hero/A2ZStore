import { useMemo } from 'react'
import { StoreContext } from './StoreContext.js'
import usePersistentState from './usePersistentState.js'
import { hashPassword, uid } from './storage.js'
import { seedCategories, seedProducts } from './data.js'
import { isInStock } from './helpers.js'

export default function StoreProvider({ children }) {
  const [categories, setCategories] = usePersistentState('categories', () => seedCategories)
  const [products, setProducts] = usePersistentState('products', () => seedProducts)
  const [users, setUsers] = usePersistentState('users', [])
  const [orders, setOrders] = usePersistentState('orders', [])
  const [sessionId, setSessionId] = usePersistentState('session', null)
  const [cart, setCart] = usePersistentState('cart', [])

  const value = useMemo(() => {
    const me = users.find((u) => u.id === sessionId) ?? null
    const user = me && { id: me.id, name: me.name, email: me.email, role: me.role }
    const isOwner = me?.role === 'owner'
    const isStaff = me?.role === 'owner' || me?.role === 'admin'
    const deny = { ok: false, error: 'err.denied' }

    const cartLines = cart
      .map((c) => ({ product: products.find((p) => p.id === c.id), qty: c.qty }))
      .filter((l) => l.product)
    const cartCount = cartLines.reduce((s, l) => s + l.qty, 0)
    const cartTotal = cartLines.reduce((s, l) => s + l.qty * l.product.price, 0)

    /* ---------------- cart ---------------- */
    const addToCart = (id, qty = 1) => {
      const product = products.find((p) => p.id === id)
      if (!product || !isInStock(product)) return { ok: false, error: 'err.outOfStock' }
      const current = cart.find((c) => c.id === id)?.qty ?? 0
      if (current + qty > product.stock) return { ok: false, error: 'err.maxStock' }
      setCart(current ? cart.map((c) => (c.id === id ? { ...c, qty: c.qty + qty } : c)) : [...cart, { id, qty }])
      return { ok: true }
    }
    const setCartQty = (id, qty) => {
      const product = products.find((p) => p.id === id)
      const next = Math.min(qty, product?.stock ?? 0)
      setCart(next <= 0 ? cart.filter((c) => c.id !== id) : cart.map((c) => (c.id === id ? { ...c, qty: next } : c)))
    }
    const removeFromCart = (id) => setCart(cart.filter((c) => c.id !== id))

    /* ---------------- auth ---------------- */
    const register = async ({ name, email, password }) => {
      const mail = email.trim().toLowerCase()
      if (password.length < 6) return { ok: false, error: 'auth.short' }
      if (users.some((u) => u.email === mail)) return { ok: false, error: 'auth.exists' }
      const salt = uid('s')
      const account = {
        id: uid('u'), name: name.trim(), email: mail, salt,
        hash: await hashPassword(password, salt),
        role: users.length === 0 ? 'owner' : 'user', // the very first account is the Owner
        createdAt: new Date().toISOString(),
      }
      setUsers([...users, account])
      setSessionId(account.id)
      return { ok: true, firstOwner: users.length === 0 }
    }
    const login = async ({ email, password }) => {
      const account = users.find((u) => u.email === email.trim().toLowerCase())
      if (!account || (await hashPassword(password, account.salt)) !== account.hash) {
        return { ok: false, error: 'auth.invalid' }
      }
      setSessionId(account.id)
      return { ok: true }
    }
    const logout = () => setSessionId(null)

    /* ---------------- orders ---------------- */
    const createOrder = (customer) => {
      if (!user) return { ok: false, error: 'checkout.signinFirst' }
      if (!cartLines.length) return { ok: false, error: 'cart.empty' }
      if (cartLines.some((l) => !isInStock(l.product) || l.qty > l.product.stock)) {
        return { ok: false, error: 'err.stock' }
      }
      const seq = orders.reduce((m, o) => Math.max(m, o.seq), 1000) + 1
      const order = {
        id: uid('o'), seq, number: `Z2A-${seq}`, userId: user.id, customer,
        items: cartLines.map(({ product, qty }) => ({
          productId: product.id, name: product.name, price: product.price, qty,
        })),
        total: cartTotal, payment: 'cod', status: 'pending', createdAt: new Date().toISOString(),
      }
      setProducts(products.map((p) => {
        const line = cartLines.find((l) => l.product.id === p.id)
        return line ? { ...p, stock: p.stock - line.qty } : p
      }))
      setOrders([order, ...orders])
      setCart([])
      return { ok: true, order }
    }
    const updateOrderStatus = (id, status) => {
      if (!isStaff) return deny
      const order = orders.find((o) => o.id === id)
      if (!order || order.status === 'cancelled') return { ok: false, error: 'err.locked' }
      if (status === 'cancelled') {
        // give the stock back
        setProducts(products.map((p) => {
          const item = order.items.find((i) => i.productId === p.id)
          return item ? { ...p, stock: p.stock + item.qty } : p
        }))
      }
      setOrders(orders.map((o) => (o.id === id ? { ...o, status } : o)))
      return { ok: true }
    }

    /* ---------------- admin: products & categories ---------------- */
    const saveProduct = (draft) => {
      if (!isStaff) return deny
      if (!draft.name.en.trim()) return { ok: false, error: 'err.name' }
      if (!categories.some((c) => c.id === draft.categoryId)) return { ok: false, error: 'err.category' }
      if (!(draft.price >= 0) || !Number.isInteger(draft.stock) || draft.stock < 0) return { ok: false, error: 'err.number' }
      if (draft.oldPrice && draft.oldPrice < draft.price) return { ok: false, error: 'err.oldPrice' }
      const clean = { ...draft, oldPrice: draft.oldPrice || null }
      setProducts(
        products.some((p) => p.id === draft.id)
          ? products.map((p) => (p.id === draft.id ? clean : p))
          : [{ ...clean, id: uid('p'), createdAt: new Date().toISOString() }, ...products],
      )
      return { ok: true }
    }
    const deleteProduct = (id) => {
      if (!isStaff) return deny
      setProducts(products.filter((p) => p.id !== id))
      setCart(cart.filter((c) => c.id !== id))
      return { ok: true }
    }
    const saveCategory = (draft) => {
      if (!isStaff) return deny
      if (!draft.name.en.trim()) return { ok: false, error: 'err.name' }
      const exists = categories.some((c) => c.id === draft.id)
      const id = exists ? draft.id : uid('c')
      const clean = { ...draft, id, icon: draft.icon || '🏷️' }
      setCategories(exists ? categories.map((c) => (c.id === id ? clean : c)) : [...categories, clean])
      return { ok: true, id }
    }
    const deleteCategory = (id) => {
      if (!isStaff) return deny
      if (products.some((p) => p.categoryId === id)) return { ok: false, error: 'c.hasProducts' }
      setCategories(categories.filter((c) => c.id !== id))
      return { ok: true }
    }

    /* ---------------- admin: users ---------------- */
    const setUserRole = (id, role) => {
      if (!isOwner || id === me.id) return deny
      setUsers(users.map((u) => (u.id === id ? { ...u, role } : u)))
      return { ok: true }
    }
    const deleteUser = (id) => {
      if (!isOwner || id === me.id) return deny
      setUsers(users.filter((u) => u.id !== id))
      return { ok: true }
    }
    const resetDemo = () => {
      if (!isOwner) return deny
      setCategories(seedCategories)
      setProducts(seedProducts)
      return { ok: true }
    }

    return {
      categories, products, orders,
      users: users.map((u) => ({ id: u.id, name: u.name, email: u.email, role: u.role, createdAt: u.createdAt })), // never expose hashes to the UI
      user, isOwner, isStaff,
      cartLines, cartCount, cartTotal, addToCart, setCartQty, removeFromCart,
      register, login, logout,
      createOrder, updateOrderStatus,
      saveProduct, deleteProduct, saveCategory, deleteCategory,
      setUserRole, deleteUser, resetDemo,
    }
  }, [categories, products, users, orders, sessionId, cart, setCategories, setProducts, setUsers, setOrders, setSessionId, setCart])

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}
