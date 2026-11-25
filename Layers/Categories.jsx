import { useRef } from 'react'
import { useApp } from '../src/AppContext.js'
import { categories } from '../src/data.js'
import Icon from './Icons.jsx'

export default function Categories() {
  const { t, tr, lang } = useApp()
  const track = useRef(null)
  const dir = lang === 'ar' ? -1 : 1 // scroll direction flips in RTL

  const slide = (step) =>
    track.current?.scrollBy({ left: step * dir * 280, behavior: 'smooth' })

  return (
    <section id="categories" className="section">
      <div className="container">
        <div className="section__head">
          <div>
            <h2>{t('cat.title')}</h2>
            <p>{t('cat.subtitle')}</p>
          </div>
          <div className="slider-controls">
            <button className="icon-btn icon-btn--ring flip-rtl-back" onClick={() => slide(-1)} aria-label={t('cat.prev')}>
              <span className="chev chev--prev"><Icon name="chevron" /></span>
            </button>
            <button className="icon-btn icon-btn--ring" onClick={() => slide(1)} aria-label={t('cat.next')}>
              <span className="chev chev--next"><Icon name="chevron" /></span>
            </button>
          </div>
        </div>

        <div className="slider" ref={track} tabIndex={0}>
          {categories.map((c) => (
            <a key={c.id} href="#shop" className="cat-card">
              <span className="cat-card__icon">{c.icon}</span>
              <span className="cat-card__name">{tr(c.name)}</span>
              <span className="cat-card__cta">{t('cat.explore')}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
