import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../src/AppContext.js'
import { useStore } from '../src/StoreContext.js'
import Icon from './Icons.jsx'

// Home slider: every card opens that category's page.
export default function Categories() {
  const { t, tr, lang } = useApp()
  const { categories, products } = useStore()
  const track = useRef(null)
  const dir = lang === 'ar' ? -1 : 1 // scroll direction flips in RTL

  const slide = (step) => track.current?.scrollBy({ left: step * dir * 280, behavior: 'smooth' })
  if (categories.length === 0) return null

  return (
    <section id="categories" className="section">
      <div className="container">
        <div className="section__head">
          <div>
            <h2>{t('cat.title')}</h2>
            <p>{t('cat.subtitle')}</p>
          </div>
          <div className="slider-controls">
            <button className="icon-btn icon-btn--ring" onClick={() => slide(-1)} aria-label={t('cat.prev')}>
              <span className="chev chev--prev"><Icon name="chevron" /></span>
            </button>
            <button className="icon-btn icon-btn--ring" onClick={() => slide(1)} aria-label={t('cat.next')}>
              <span className="chev chev--next"><Icon name="chevron" /></span>
            </button>
          </div>
        </div>

        <div className="slider" ref={track} tabIndex={0}>
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
