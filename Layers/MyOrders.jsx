import { Link } from 'react-router-dom'
import { useApp } from '../src/AppContext.js'
import { useStore } from '../src/StoreContext.js'
import OrderDetails from './OrderDetails.jsx'

// /orders : the orders of the signed-in user
export default function MyOrders() {
  const { t, money, formatDate } = useApp()
  const { user, orders, ready } = useStore()

  if (!ready) return <div className="container loading" role="status" aria-label={t('common.loading')} />

  if (!user) {
    return (
      <section className="section">
        <div className="container empty">
          <p>{t('checkout.signinFirst')}</p>
          <Link to="/login?next=/orders" className="btn btn--primary">{t('nav.signin')}</Link>
        </div>
      </section>
    )
  }

  const mine = orders.filter((o) => o.userId === user.id)

  return (
    <section className="section">
      <div className="container">
        <div className="page-head"><h1>{t('orders.title')}</h1></div>
        {mine.length === 0 ? (
          <div className="empty">
            <p>{t('orders.empty')}</p>
            <Link to="/shop" className="btn btn--primary">{t('checkout.continue')}</Link>
          </div>
        ) : (
          <div className="order-list">
            {mine.map((o) => (
              <details key={o.id} className="card order">
                <summary>
                  <b>{o.number}</b>
                  <span>{formatDate(o.createdAt)}</span>
                  <span className={`status status--${o.status}`}>{t(`status.${o.status}`)}</span>
                  <strong>{money(o.total)}</strong>
                </summary>
                <OrderDetails order={o} />
              </details>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
