import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../src/AppContext.js'
import { useStore } from '../src/StoreContext.js'
import Icon from './Icons.jsx'
import Photo from './Photo.jsx'

export default function CartDrawer() {
  const { t, tr, money, cartOpen, setCartOpen, notify } = useApp()
  const { cartLines, cartTotal, setCartQty, removeFromCart } = useStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (!cartOpen) return
    const onKey = (e) => e.key === 'Escape' && setCartOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [cartOpen, setCartOpen])

  const close = () => setCartOpen(false)
  const checkout = () => {
    close()
    navigate('/checkout')
  }
  const plus = (product, qty) => {
    if (qty + 1 > product.stock) return notify(t('err.maxStock'), 'error')
    setCartQty(product.id, qty + 1)
  }

  return (
    <div className={`drawer ${cartOpen ? 'is-open' : ''}`} aria-hidden={!cartOpen}>
      <div className="drawer__scrim" onClick={close} />
      <aside className="drawer__panel" role="dialog" aria-modal="true" aria-label={t('cart.title')}>
        <div className="drawer__head">
          <h3>{t('cart.title')}</h3>
          <button className="icon-btn" onClick={close} aria-label={t('common.close')}>
            <Icon name="close" />
          </button>
        </div>

        <div className="drawer__body">
          {cartLines.length === 0 && <p className="muted">{t('cart.empty')}</p>}
          {cartLines.map(({ product, qty }) => (
            <div key={product.id} className="line">
              <Photo src={product.image} alt="" className="photo-box--thumb" />
              <div className="line__info">
                <Link to={`/product/${product.id}`} onClick={close}><b>{tr(product.name)}</b></Link>
                <span>{money(product.price)}</span>
                <div className="qty">
                  <button onClick={() => setCartQty(product.id, qty - 1)} aria-label="-">−</button>
                  <span>{qty}</span>
                  <button onClick={() => plus(product, qty)} aria-label="+">+</button>
                </div>
              </div>
              <button className="link-btn" onClick={() => removeFromCart(product.id)}>{t('cart.remove')}</button>
            </div>
          ))}
        </div>

        <div className="drawer__foot">
          <div className="total">
            <span>{t('cart.total')}</span>
            <strong>{money(cartTotal)}</strong>
          </div>
          <button className="btn btn--primary btn--block" disabled={cartLines.length === 0} onClick={checkout}>
            {t('cart.checkout')}
          </button>
        </div>
      </aside>
    </div>
  )
}
