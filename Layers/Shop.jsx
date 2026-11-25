import { useState } from 'react'
import { useApp } from '../src/AppContext.js'
import { useStore } from '../src/StoreContext.js'
import ProductCard from './prodectscard.jsx'

// Shop page: all products, with search and category filter.
export default function Shop() {
  const { t, tr } = useApp()
  const { products, categories } = useStore()
  const [query, setQuery] = useState('')
  const [cat, setCat] = useState('all')

  const q = query.trim().toLowerCase()
  const list = products.filter(
    (p) =>
      (cat === 'all' || p.categoryId === cat) &&
      (!q || `${p.name.en} ${p.name.ar}`.toLowerCase().includes(q)),
  )

  return (
    <section className="section">
      <div className="container">
        <div className="page-head">
          <h1>{t('shop.title')}</h1>
          <p>{t('shop.subtitle')}</p>
        </div>

        <div className="toolbar">
          <input
            type="search"
            className="input"
            placeholder={t('shop.search')}
            aria-label={t('common.search')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="chips">
            <button className={`chip ${cat === 'all' ? 'is-active' : ''}`} onClick={() => setCat('all')}>
              {t('common.all')}
            </button>
            {categories.map((c) => (
              <button key={c.id} className={`chip ${cat === c.id ? 'is-active' : ''}`} onClick={() => setCat(c.id)}>
                {tr(c.name)}
              </button>
            ))}
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
