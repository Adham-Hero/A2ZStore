import { Fragment, useEffect, useState } from 'react'
import { useApp } from '../../src/AppContext.js'
import { useStore } from '../../src/StoreContext.js'
import { ORDER_STATUSES } from '../../src/data.js'
import OrderDetails from '../OrderDetails.jsx'

export default function AdminOrders() {
  const { t, money, formatDate, notify } = useApp()
  const { orders, updateOrderStatus, refreshOrders } = useStore()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [open, setOpen] = useState(null)

  useEffect(() => {
    refreshOrders() // always show the newest orders when the tab opens
  }, [refreshOrders])

  const q = query.trim().toLowerCase()
  const list = orders.filter(
    (o) =>
      (status === 'all' || o.status === status) &&
      (!q || `${o.number} ${o.customer.name} ${o.customer.phone}`.toLowerCase().includes(q)),
  )

  const change = async (order, next) => {
    if (next === 'cancelled' && !window.confirm(t('o.cancelConfirm'))) return
    const r = await updateOrderStatus(order.id, next)
    if (!r.ok) notify(t(r.error), 'error')
  }

  return (
    <>
      <div className="toolbar">
        <input type="search" className="input" placeholder={t('o.search')} value={query} onChange={(e) => setQuery(e.target.value)} />
        <div className="chips">
          {['all', ...ORDER_STATUSES].map((s) => (
            <button key={s} className={`chip ${status === s ? 'is-active' : ''}`} onClick={() => setStatus(s)}>
              {s === 'all' ? t('common.all') : t(`status.${s}`)}
            </button>
          ))}
        </div>
      </div>

      {list.length === 0 ? (
        <p className="muted">{t('o.empty')}</p>
      ) : (
        <div className="table-wrap card">
          <table>
            <thead>
              <tr>
                <th>{t('orders.number')}</th><th>{t('orders.date')}</th><th>{t('orders.customer')}</th>
                <th>{t('orders.total')}</th><th>{t('orders.status')}</th><th />
              </tr>
            </thead>
            <tbody>
              {list.map((o) => (
                <Fragment key={o.id}>
                  <tr>
                    <td><b>{o.number}</b></td>
                    <td>{formatDate(o.createdAt)}</td>
                    <td>{o.customer.name}</td>
                    <td>{money(o.total)}</td>
                    <td>
                      <select
                        className={`status-select status--${o.status}`}
                        value={o.status}
                        disabled={o.status === 'cancelled'}
                        onChange={(e) => change(o, e.target.value)}
                        aria-label={t('orders.status')}
                      >
                        {ORDER_STATUSES.map((s) => <option key={s} value={s}>{t(`status.${s}`)}</option>)}
                      </select>
                    </td>
                    <td className="actions">
                      <button className="link-btn" onClick={() => setOpen(open === o.id ? null : o.id)}>
                        {t('orders.details')}
                      </button>
                    </td>
                  </tr>
                  {open === o.id && (
                    <tr className="row-detail"><td colSpan={6}><OrderDetails order={o} /></td></tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
