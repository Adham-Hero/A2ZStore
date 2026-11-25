import { useApp } from '../src/AppContext.js'

// Items + delivery info of one order (used by "My orders" and by the admin dashboard).
export default function OrderDetails({ order }) {
  const { t, tr, money } = useApp()
  const c = order.customer
  return (
    <div className="order__body">
      <ul className="order__items">
        {order.items.map((i) => (
          <li key={i.productId}>
            <span>{tr(i.name)} × {i.qty}</span>
            <b>{money(i.price * i.qty)}</b>
          </li>
        ))}
      </ul>
      <dl className="order__info">
        <div><dt>{t('orders.customer')}</dt><dd>{c.name}</dd></div>
        <div><dt>{t('o.phone')}</dt><dd dir="ltr">{c.phone}</dd></div>
        <div><dt>{t('o.address')}</dt><dd>{c.city} — {c.address}</dd></div>
        {c.notes && <div><dt>{t('o.notes')}</dt><dd>{c.notes}</dd></div>}
        <div><dt>{t('o.payment')}</dt><dd>{t('checkout.cod')}</dd></div>
        <div><dt>{t('orders.total')}</dt><dd><b>{money(order.total)}</b></dd></div>
      </dl>
    </div>
  )
}
