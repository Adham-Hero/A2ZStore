import { useState } from 'react'
import { Link } from 'react-router-dom'
import Photo from './Photo.jsx'
import { useApp } from '../src/AppContext.js'
import { useStore } from '../src/StoreContext.js'

// Checkout page: /checkout  (needs a signed-in user, creates the order, reduces the stock)
export default function Chiickout() {
  const { t, tr, money, notify } = useApp()
  const { user, cartLines, cartTotal, createOrder, ready } = useStore()
  const [error, setError] = useState('')
  const [done, setDone] = useState(null)
  const [busy, setBusy] = useState(false)

  if (!ready) return <div className="container loading" role="status" aria-label={t('common.loading')} />

  if (done) {
    return (
      <section className="section">
        <div className="container empty">
          <div className="success-mark" aria-hidden="true">✓</div>
          <h1>{t('checkout.thanks')}</h1>
          <p>{t('checkout.orderNo')}: <b>{done.number}</b></p>
          <div className="row-gap">
            <Link to="/orders" className="btn btn--primary">{t('nav.myOrders')}</Link>
            <Link to="/shop" className="btn btn--outline">{t('checkout.continue')}</Link>
          </div>
        </div>
      </section>
    )
  }

  if (cartLines.length === 0) {
    return (
      <section className="section">
        <div className="container empty">
          <p>{t('cart.empty')}</p>
          <Link to="/shop" className="btn btn--primary">{t('checkout.continue')}</Link>
        </div>
      </section>
    )
  }

  const submit = async (e) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    setBusy(true)
    const result = await createOrder({
      name: f.get('name').trim(),
      phone: f.get('phone').trim(),
      city: f.get('city').trim(),
      address: f.get('address').trim(),
      notes: f.get('notes').trim(),
    })
    setBusy(false)
    if (result.ok) {
      setDone(result.order)
      notify(t('checkout.thanks'))
    } else setError(t(result.error))
  }

  return (
    <section className="section">
      <div className="container">
        <div className="page-head"><h1>{t('checkout.title')}</h1></div>

        <div className="checkout">
          {user ? (
            <form className="card form" onSubmit={submit}>
              <h3>{t('checkout.details')}</h3>
              <label>{t('checkout.name')}
                <input name="name" required defaultValue={user.name} autoComplete="name" />
              </label>
              <div className="form__row">
                <label>{t('checkout.phone')}
                  <input name="phone" type="tel" required autoComplete="tel" dir="ltr" />
                </label>
                <label>{t('checkout.city')}
                  <input name="city" required autoComplete="address-level2" />
                </label>
              </div>
              <label>{t('checkout.address')}
                <textarea name="address" rows="3" required autoComplete="street-address" />
              </label>
              <label>{t('checkout.notes')}
                <textarea name="notes" rows="2" />
              </label>
              <label>{t('checkout.payment')}
                <select name="payment" defaultValue="cod" disabled>
                  <option value="cod">{t('checkout.cod')}</option>
                </select>
              </label>
              {error && <p className="form__error" role="alert">{error}</p>}
              <button className="btn btn--primary" type="submit" disabled={busy}>{busy ? '…' : t('checkout.place')}</button>
            </form>
          ) : (
            <div className="card empty">
              <p>{t('checkout.signinFirst')}</p>
              <Link to="/login?next=/checkout" className="btn btn--primary">{t('nav.signin')}</Link>
            </div>
          )}

          <aside className="card summary">
            <h3>{t('checkout.summary')}</h3>
            {cartLines.map(({ product, qty }) => (
              <div key={product.id} className="summary__line">
                <Photo src={product.image} alt="" className="photo-box--thumb" />
                <span>{tr(product.name)} × {qty}</span>
                <b>{money(product.price * qty)}</b>
              </div>
            ))}
            <div className="total">
              <span>{t('cart.total')}</span>
              <strong>{money(cartTotal)}</strong>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}
