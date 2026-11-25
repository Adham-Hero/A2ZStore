import { Link, useParams } from 'react-router-dom'
import { useApp } from '../src/AppContext.js'
import { useStore } from '../src/StoreContext.js'
import ProductCard from './prodectscard.jsx'

// /categories      -> page with all categories
// /categories/:id  -> the products of that category
export default function Caregores() {
  const { id } = useParams()
  const { t, tr } = useApp()
  const { categories, products } = useStore()

  if (id) {
    const category = categories.find((c) => c.id === id)
    if (!category) {
      return (
        <section className="section">
          <div className="container empty">
            <p>{t('categories.notFound')}</p>
            <Link to="/categories" className="btn btn--primary">{t('categories.all')}</Link>
          </div>
        </section>
      )
    }
    const list = products.filter((p) => p.categoryId === id)
    return (
      <section className="section">
        <div className="container">
          <Link to="/categories" className="back-link">← {t('categories.all')}</Link>
          <div className="page-head">
            <h1>{category.icon} {tr(category.name)}</h1>
            <p>{list.length} {t('common.items')}</p>
          </div>
          {list.length === 0 ? (
            <p className="muted">{t('common.noProducts')}</p>
          ) : (
            <div className="grid">{list.map((p) => <ProductCard key={p.id} product={p} />)}</div>
          )}
        </div>
      </section>
    )
  }

  return (
    <section className="section">
      <div className="container">
        <div className="page-head">
          <h1>{t('categories.title')}</h1>
          <p>{t('categories.subtitle')}</p>
        </div>
        <div className="cat-grid">
          {categories.map((c) => (
            <Link key={c.id} to={`/categories/${c.id}`} className="cat-card">
              <span className="cat-card__icon">{c.icon}</span>
              <span className="cat-card__name">{tr(c.name)}</span>
              <span className="cat-card__cta">
                {products.filter((p) => p.categoryId === c.id).length} {t('common.items')}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
