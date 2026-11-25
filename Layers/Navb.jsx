import { useState } from 'react'
import { useApp } from '../src/AppContext.js'
import Icon from './Icons.jsx'
import Logo from './Logo.jsx'

const links = [
  ['nav.home', '#home'],
  ['nav.shop', '#shop'],
  ['nav.categories', '#categories'],
  ['nav.about', '#about'],
  ['nav.contact', '#contact'],
]

const Navb = () => {
  const { t, theme, toggleTheme, toggleLang, cartCount, setCartOpen, setSignInOpen } = useApp()
  const [open, setOpen] = useState(false)

  return (
    <header className="nav">
      <div className="container nav__inner">
        <a href="#home" className="nav__brand" aria-label={t('brand')}>
          <Logo />
        </a>

        <nav className={`nav__links ${open ? 'is-open' : ''}`} aria-label="Main">
          {links.map(([key, href]) => (
            <a key={key} href={href} onClick={() => setOpen(false)}>
              {t(key)}
            </a>
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
          <button className="btn btn--primary btn--sm signin-btn" onClick={() => setSignInOpen(true)}>
            <Icon name="user" size={16} />
            <span className="signin-btn__label">{t('nav.signin')}</span>
          </button>
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
