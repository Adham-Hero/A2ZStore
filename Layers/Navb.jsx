import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useApp } from '../src/AppContext.js'
import { useStore } from '../src/StoreContext.js'
import Icon from './Icons.jsx'
import Logo from './Logo.jsx'

const pageLinks = [
  ['nav.home', '/'],
  ['nav.shop', '/shop'],
  ['nav.categories', '/categories'],
]
const hashLinks = [
  ['nav.about', '/#about'],
  ['nav.contact', '/#contact'],
]

const Navb = () => {
  const { t, theme, toggleTheme, toggleLang, setCartOpen, setSignInOpen } = useApp()
  const { user, isStaff, logout, cartCount } = useStore()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [menu, setMenu] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!menu) return
    const close = (e) => !menuRef.current?.contains(e.target) && setMenu(false)
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [menu])

  const go = (path) => {
    setMenu(false)
    navigate(path)
  }

  return (
    <header className="nav">
      <div className="container nav__inner">
        {/* the logo sits at the top-right corner */}
        <Link to="/" className="nav__brand" aria-label={t('brand')}>
          <Logo height={34} />
        </Link>

        <nav className={`nav__links ${open ? 'is-open' : ''}`} aria-label="Main">
          {pageLinks.map(([key, to]) => (
            <NavLink key={key} to={to} end={to === '/'} onClick={() => setOpen(false)}>
              {t(key)}
            </NavLink>
          ))}
          {hashLinks.map(([key, to]) => (
            <Link key={key} to={to} onClick={() => setOpen(false)}>
              {t(key)}
            </Link>
          ))}
        </nav>

        <div className="nav__actions">
          <button className="icon-btn icon-btn--text" onClick={toggleLang} aria-label={t('nav.langAria')}>
            {t('nav.langLabel')}
          </button>
          <button
            className="icon-btn"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? t('nav.toLight') : t('nav.toDark')}
          >
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
          </button>
          <button className="icon-btn cart-btn" onClick={() => setCartOpen(true)} aria-label={t('nav.cart')}>
            <Icon name="cart" />
            {cartCount > 0 && <span className="badge">{cartCount}</span>}
          </button>

          {user ? (
            <div className="user-menu" ref={menuRef}>
              <button
                className="btn btn--primary btn--sm signin-btn"
                onClick={() => setMenu((m) => !m)}
                aria-haspopup="menu"
                aria-expanded={menu}
                aria-label={t('nav.account')}
              >
                <Icon name="user" size={16} />
                <span className="signin-btn__label">{user.name.split(' ')[0]}</span>
              </button>
              {menu && (
                <div className="user-menu__panel" role="menu">
                  <p className="user-menu__who">
                    <b>{user.name}</b>
                    <span>{t(`u.role.${user.role}`)}</span>
                  </p>
                  <button role="menuitem" onClick={() => go('/orders')}>{t('nav.myOrders')}</button>
                  {isStaff && <button role="menuitem" onClick={() => go('/admin')}>{t('nav.dashboard')}</button>}
                  <button
                    role="menuitem"
                    onClick={() => {
                      logout()
                      go('/')
                    }}
                  >
                    {t('nav.signout')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button className="btn btn--primary btn--sm signin-btn" onClick={() => setSignInOpen(true)}>
              <Icon name="user" size={16} />
              <span className="signin-btn__label">{t('nav.signin')}</span>
            </button>
          )}

          <button
            className="icon-btn burger"
            onClick={() => setOpen((o) => !o)}
            aria-label={t('nav.menu')}
            aria-expanded={open}
          >
            <Icon name={open ? 'close' : 'menu'} />
          </button>
        </div>
      </div>
    </header>
  )
}

export default Navb
