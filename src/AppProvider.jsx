import { useCallback, useEffect, useMemo, useState } from 'react'
import { AppContext } from './AppContext.js'
import { translations } from './i18n.js'
import { load, save } from './storage.js'

const initialTheme = () =>
  load('theme', window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')

export default function AppProvider({ children }) {
  const [theme, setTheme] = useState(initialTheme)
  const [lang, setLang] = useState(() => load('lang', 'en'))
  const [cartOpen, setCartOpen] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-theme', theme)
    root.lang = lang
    root.dir = lang === 'ar' ? 'rtl' : 'ltr'
    save('theme', theme)
    save('lang', lang)
  }, [theme, lang])

  useEffect(() => {
    if (!toast) return
    const id = setTimeout(() => setToast(null), 2600)
    return () => clearTimeout(id)
  }, [toast])

  const notify = useCallback((message, tone = 'ok') => setToast({ message, tone, key: Date.now() }), [])

  const value = useMemo(() => {
    // t('key', { n: 3 }) replaces {n} in the text
    const t = (key, params) => {
      let text = translations[lang][key] ?? key
      if (params) for (const [k, v] of Object.entries(params)) text = text.replaceAll(`{${k}}`, v)
      return text
    }
    // tr({en, ar}) -> text in the current language (falls back to the other one)
    const tr = (obj) => (obj ? obj[lang] || obj.en || obj.ar || '' : '')
    const locale = lang === 'ar' ? 'ar-EG' : 'en-GB'
    const money = (n) =>
      lang === 'ar' ? `${Number(n).toLocaleString('ar-EG')} ج.م` : `EGP ${Number(n).toLocaleString('en-US')}`
    const formatDate = (iso) =>
      new Date(iso).toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short' })

    return {
      theme, lang, t, tr, money, formatDate, notify, toast,
      toggleTheme: () => setTheme((x) => (x === 'dark' ? 'light' : 'dark')),
      toggleLang: () => setLang((x) => (x === 'en' ? 'ar' : 'en')),
      cartOpen, setCartOpen,
    }
  }, [theme, lang, notify, toast, cartOpen])

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
