import { useEffect } from 'react'
import { useApp } from '../src/AppContext.js'
import Icon from './Icons.jsx'

export default function CartDrawer() {
  const { t, money, cart, cartTotal, changeQty, removeItem, cartOpen, setCartOpen } = useApp()

  useEffect(() => {
    if (!cartOpen) return
    const onKey = (e) => e.key === 'Escape' && setCartOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [cartOpen, setCartOpen])

  return (
    <div className={`drawer ${cartOpen ? 'is-open' : ''}`} aria-hidden={!cartOpen}>
      <div className="drawer__scrim" onClick={() => setCartOpen(false)} />
      <aside className="drawer__panel" role="dialog" aria-modal="true" aria-label={t('cart.title')}>
        <div className="drawer__head">
          <h3>{t('cart.title')}</h3>
          <button className="icon-btn" onClick={() => setCartOpen(false)} aria-label={t('cart.close')}>
            <Icon name="close" />
          </button>
        </div>

        <div className="drawer__body">
          {cart.length === 0 && <p className="muted">{t('cart.empty')}</p>}
          {cart.map((item) => (
            <div key={item.id} className="line">
              <span className="line__icon">{item.icon}</span>
              <div className="line__info">
                <b>{item.name}</b>
                <span>{money(item.price)}</span>
                <div className="qty">
                  <button onClick={() => changeQty(item.id, -1)} aria-label="-">−</button>
                  <span>{item.qty}</span>
                  <button onClick={() => changeQty(item.id, 1)} aria-label="+">+</button>
                </div>
              </div>
              <button className="link-btn" onClick={() => removeItem(item.id)}>{t('cart.remove')}</button>
            </div>
          ))}
        </div>

        <div className="drawer__foot">
          <div className="total">
            <span>{t('cart.total')}</span>
            <strong>{money(cartTotal)}</strong>
          </div>
          <button className="btn btn--primary btn--block" disabled={cart.length === 0}>
            {t('cart.checkout')}
          </button>
        </div>
      </aside>
    </div>
  )
}
