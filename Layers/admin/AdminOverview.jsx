import { useEffect } from 'react'
import { useApp } from '../../src/AppContext.js'
import { useStore } from '../../src/StoreContext.js'
import { LOW_STOCK } from '../../src/data.js'

export default function AdminOverview({ goTo }) {
  const { t, money, formatDate, notify } = useApp()
  const { products, orders, users, isOwner, resetDemo, refreshOrders, refreshUsers } = useStore()

  useEffect(() => {
    refreshOrders()
    refreshUsers()
  }, [refreshOrders, refreshUsers])

  const low = products.filter((p) => !p.available || p.stock <= LOW_STOCK).length
  const pending = orders.filter((o) => o.status === 'pending').length
  const revenue = orders.filter((o) => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0)

  const stats = [
    ['admin.stat.products', products.length, 'products'],
    ['admin.stat.lowStock', low, 'products'],
    ['admin.stat.orders', orders.length, 'orders'],
    ['admin.stat.pending', pending, 'orders'],
    ['admin.stat.revenue', money(revenue), 'orders'],
    ['admin.stat.users', users.length, 'users'],
  ]

  const reset = async () => {
    if (!window.confirm(t('admin.resetConfirm'))) return
    const r = await resetDemo()
    notify(r.ok ? t('toast.saved') : t(r.error), r.ok ? 'ok' : 'error')
  }

  return (
    <>
      <div className="stats">
        {stats.map(([key, value, to]) => (
          <button key={key} className="card stat" onClick={() => goTo(to)}>
            <span>{t(key)}</span>
            <strong>{value}</strong>
          </button>
        ))}
      </div>

      <h3 className="admin__h">{t('admin.tab.orders')}</h3>
      {orders.length === 0 ? (
        <p className="muted">{t('o.empty')}</p>
      ) : (
        <div className="table-wrap card">
          <table>
            <tbody>
              {orders.slice(0, 5).map((o) => (
                <tr key={o.id}>
                  <td><b>{o.number}</b></td>
                  <td>{formatDate(o.createdAt)}</td>
                  <td>{o.customer.name}</td>
                  <td><span className={`status status--${o.status}`}>{t(`status.${o.status}`)}</span></td>
                  <td>{money(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isOwner && (
        <p style={{ marginTop: '1.5rem' }}>
          <button className="btn btn--outline btn--sm" onClick={reset}>{t('admin.reset')}</button>
        </p>
      )}
    </>
  )
}
