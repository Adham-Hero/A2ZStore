import { useEffect, useMemo, useState } from 'react'
import { AppContext } from './AppContext.js'
import { translations } from './i18n.js'

const read = (key, fallback) => {
  try {
    return localStorage.getItem(key) || fallback
  } catch {
    return fallback
  }
}
const write = (key, value) => {
  try {
    localStorage.setItem(key, value)
  } catch {
    /* storage unavailable: ignore */
  }
}

const initialTheme = () =>
  read('theme', window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')

export default function AppProvider({ children }) {
  const [theme, setTheme] = useState(initialTheme)
  const [lang, setLang] = useState(() => read('lang', 'en'))
  const [cart, setCart] = useState([])
  const [cartOpen, setCartOpen] = useState(false)
  const [signInOpen, setSignInOpen] = useState(false)

  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-theme', theme)
    root.lang = lang
    root.dir = lang === 'ar' ? 'rtl' : 'ltr'
    write('theme', theme)
    write('lang', lang)
  }, [theme, lang])

  const value = useMemo(() => {
    const t = (key) => translations[lang][key] ?? key
    const tr = (obj) => obj[lang]
    const money = (n) =>
      lang === 'ar'
        ? `${n.toLocaleString('ar-EG')} ج.م`
        : `EGP ${n.toLocaleString('en-US')}`

    const addToCart = (item) =>
      setCart((c) => {
        const found = c.find((x) => x.id === item.id)
        return found
          ? c.map((x) => (x.id === item.id ? { ...x, qty: x.qty + 1 } : x))
          : [...c, { ...item, qty: 1 }]
      })
    const changeQty = (id, delta) =>
      setCart((c) =>
        c.map((x) => (x.id === id ? { ...x, qty: x.qty + delta } : x)).filter((x) => x.qty > 0),
      )
    const removeItem = (id) => setCart((c) => c.filter((x) => x.id !== id))

    return {
      theme,
      lang,
      t,
      tr,
      money,
      toggleTheme: () => setTheme((x) => (x === 'dark' ? 'light' : 'dark')),
      toggleLang: () => setLang((x) => (x === 'en' ? 'ar' : 'en')),
      cart,
      cartCount: cart.reduce((s, x) => s + x.qty, 0),
      cartTotal: cart.reduce((s, x) => s + x.qty * x.price, 0),
      addToCart,
      changeQty,
      removeItem,
      cartOpen,
      setCartOpen,
      signInOpen,
      setSignInOpen,
    }
  }, [theme, lang, cart, cartOpen, signInOpen])

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
