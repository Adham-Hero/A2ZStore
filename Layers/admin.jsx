import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../src/AppContext.js'
import { useStore } from '../src/StoreContext.js'
import AdminOverview from './admin/AdminOverview.jsx'
import AdminProducts from './admin/AdminProducts.jsx'
import AdminCategories from './admin/AdminCategories.jsx'
import AdminOrders from './admin/AdminOrders.jsx'
import AdminUsers from './admin/AdminUsers.jsx'
import './admin/admin.css'

// Admin dashboard (/admin) - only for the Owner and Admins.
//  Products   : add / edit / delete, price before & after discount, stock number, in/out of stock, photo
//  Categories : add / rename / delete
//  Orders     : every order with date, number and details, change status
//  Users      : list users, change role (owner / admin / user) - Owner only
const tabs = {
  overview: AdminOverview,
  products: AdminProducts,
  categories: AdminCategories,
  orders: AdminOrders,
  users: AdminUsers,
}

const Admin = () => {
  const { t } = useApp()
  const { user, isStaff, ready } = useStore()
  const [tab, setTab] = useState('overview')

  if (!ready) return <div className="container loading" role="status" aria-label={t('common.loading')} />

  if (!isStaff) {
    return (
      <section className="section">
        <div className="container empty">
          <p>{t('admin.denied')}</p>
          {user ? (
            <Link to="/" className="btn btn--primary">{t('nf.home')}</Link>
          ) : (
            <Link to="/login?next=/admin" className="btn btn--primary">{t('nav.signin')}</Link>
          )}
        </div>
      </section>
    )
  }

  const Panel = tabs[tab]
  return (
    <section className="section">
      <div className="container">
        <div className="page-head">
          <h1>{t('admin.title')}</h1>
        </div>
        <div className="tabs" role="tablist">
          {Object.keys(tabs).map((key) => (
            <button
              key={key}
              role="tab"
              aria-selected={tab === key}
              className={`tab ${tab === key ? 'is-active' : ''}`}
              onClick={() => setTab(key)}
            >
              {t(`admin.tab.${key}`)}
            </button>
          ))}
        </div>
        <Panel goTo={setTab} />
      </div>
    </section>
  )
}

export default Admin
