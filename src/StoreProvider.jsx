import { useCallback, useEffect, useMemo, useState } from 'react'
import { StoreContext } from './StoreContext.js'
import usePersistentState from './usePersistentState.js'
import { api } from './api.js'
import { resizeImage } from './storage.js'

// Runs an API call and turns errors into { ok:false, error:'i18n.key' } (components show t(error)).
const run = async (fn) => {
  try {
    return { ok: true, ...(await fn()) }
  } catch (e) {
    return { ok: false, error: e.key || 'err.server' }
  }
}

const isStaffRole = (u) => u?.role === 'owner' || u?.role === 'admin'

export default function StoreProvider({ children }) {
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [users, setUsers] = useState([])
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)     // first load finished
  const [offline, setOffline] = useState(false) // server / database not reachable
  const [cart, setCart] = usePersistentState('cart', []) // [{ id, qty }] kept in the browser

  /* ---------------- loading data from the server ---------------- */
  const loadCatalog = useCallback(async () => {
    const [c, p] = await Promise.all([api.get('/categories'), api.get('/products')])
    setCategories(c)
    setProducts(p)
  }, [])

  const loadOrdersFor = useCallback(async (who) => {
    if (!who) return setOrders([])
    setOrders(await api.get(isStaffRole(who) ? '/orders' : '/orders/mine'))
  }, [])

  const bootstrap = useCallback(async () => {
    try {
      const [, me] = await Promise.all([loadCatalog(), api.get('/auth/me')])
      setUser(me.user)
      if (me.user) await loadOrdersFor(me.user).catch(() => {})
      setOffline(false)
    } catch {
      setOffline(true)
    } finally {
      setReady(true)
    }
  }, [loadCatalog, loadOrdersFor])

  useEffect(() => {
    const id = setTimeout(bootstrap, 0) // load categories, products and the session on start
    return () => clearTimeout(id)
  }, [bootstrap])

  const refreshOrders = useCallback(() => loadOrdersFor(user).catch(() => {}), [loadOrdersFor, user])
  const refreshUsers = useCallback(async () => {
    if (isStaffRole(user)) setUsers(await api.get('/users').catch(() => []))
  }, [user])

  const value = useMemo(() => {
    const isOwner = user?.role === 'owner'
    const isStaff = isStaffRole(user)
    const inStock = (p) => Boolean(p.available) && p.stock > 0

    const cartLines = cart
      .map((c) => ({ product: products.find((p) => p.id === c.id), qty: c.qty }))
      .filter((l) => l.product)
    const cartCount = cartLines.reduce((s, l) => s + l.qty, 0)
    const cartTotal = cartLines.reduce((s, l) => s + l.qty * l.product.price, 0)

    /* ---------------- cart (browser only; the server re-checks everything at checkout) ---------------- */
    const addToCart = (id, qty = 1) => {
      const product = products.find((p) => p.id === id)
      if (!product || !inStock(product)) return { ok: false, error: 'err.outOfStock' }
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

    /* ---------------- accounts ---------------- */
    const register = (body) =>
      run(async () => {
        const r = await api.post('/auth/register', body)
        setUser(r.user)
        await loadOrdersFor(r.user).catch(() => {})
        return { firstOwner: r.firstOwner }
      })
    const login = (body) =>
      run(async () => {
        const r = await api.post('/auth/login', body)
        setUser(r.user)
        await loadOrdersFor(r.user).catch(() => {})
        return {}
      })
    const logout = async () => {
      await api.post('/auth/logout').catch(() => {})
      setUser(null)
      setOrders([])
      setUsers([])
    }

    /* ---------------- orders ---------------- */
    const createOrder = (customer) =>
      run(async () => {
        const items = cartLines.map((l) => ({ productId: l.product.id, qty: l.qty }))
        const { order } = await api.post('/orders', { items, customer })
        setCart([])
        setOrders((list) => [order, ...list])
        await loadCatalog().catch(() => {}) // stock changed
        return { order }
      })
    const updateOrderStatus = (id, status) =>
      run(async () => {
        const order = await api.patch(`/orders/${id}/status`, { status })
        setOrders((list) => list.map((o) => (o.id === id ? order : o)))
        if (status === 'cancelled') await loadCatalog().catch(() => {}) // stock came back
        return {}
      })

    /* ---------------- admin: products, categories, photos ---------------- */
    const uploadImage = (file) =>
      run(async () => ({ url: (await api.upload(await resizeImage(file))).url }))

    const saveProduct = (d) =>
      run(async () => {
        const body = {
          name: d.name, description: d.description, categoryId: d.categoryId,
          price: d.price, oldPrice: d.oldPrice, stock: d.stock, available: d.available, image: d.image || '',
        }
        d.id ? await api.put(`/products/${d.id}`, body) : await api.post('/products', body)
        await loadCatalog()
        return {}
      })
    const deleteProduct = (id) =>
      run(async () => {
        await api.delete(`/products/${id}`)
        setCart((c) => c.filter((x) => x.id !== id))
        await loadCatalog()
        return {}
      })
    const saveCategory = (d) =>
      run(async () => {
        const body = { name: d.name, image: d.image || '' }
        const saved = d.id ? await api.put(`/categories/${d.id}`, body) : await api.post('/categories', body)
        await loadCatalog()
        return { id: saved.id }
      })
    const deleteCategory = (id) =>
      run(async () => {
        await api.delete(`/categories/${id}`)
        await loadCatalog()
        return {}
      })

    /* ---------------- admin: users (owner) ---------------- */
    const setUserRole = (id, role) =>
      run(async () => {
        await api.patch(`/users/${id}/role`, { role })
        await refreshUsers()
        return {}
      })
    const deleteUser = (id) =>
      run(async () => {
        await api.delete(`/users/${id}`)
        await refreshUsers()
        return {}
      })
    const resetDemo = () =>
      run(async () => {
        await api.post('/admin/reset-demo')
        await loadCatalog()
        return {}
      })

    return {
      categories, products, orders, users, user, isOwner, isStaff, ready, offline, retry: bootstrap, inStock,
      cartLines, cartCount, cartTotal, addToCart, setCartQty, removeFromCart,
      register, login, logout,
      createOrder, updateOrderStatus, refreshOrders, refreshUsers,
      uploadImage, saveProduct, deleteProduct, saveCategory, deleteCategory,
      setUserRole, deleteUser, resetDemo,
    }
  }, [categories, products, orders, users, user, ready, offline, cart, setCart, bootstrap, loadCatalog, loadOrdersFor, refreshOrders, refreshUsers])

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}
