import { Link, useParams } from 'react-router-dom'
import { useApp } from '../src/AppContext.js'
import { useStore } from '../src/StoreContext.js'
import CategoryCard from './CategoryCard.jsx'
import Photo from './Photo.jsx'
import ProductCard from './prodectscard.jsx'

// /categories      -> page with all categories (with their photos)
// /categories/:id  -> the products of that category
export default function Caregores() {
  const { id } = useParams()
  const { t, tr } = useApp()
  const { categories, products, ready } = useStore()

  if (!ready) return <div className="container loading" role="status" aria-label={t('common.loading')} />

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
          <div className="cat-banner">
            <Photo src={category.image} alt="" className="cat-banner__img" />
            <span className="cat-banner__shade" />
            <div className="cat-banner__text">
              <h1>{tr(category.name)}</h1>
              <p>{list.length} {t('common.items')}</p>
            </div>
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
          {categories.map((c) => <CategoryCard key={c.id} category={c} />)}
        </div>
      </div>
    </section>
  )
}
