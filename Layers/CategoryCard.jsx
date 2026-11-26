import { Link } from 'react-router-dom'
import { useApp } from '../src/AppContext.js'
import { useStore } from '../src/StoreContext.js'
import Photo from './Photo.jsx'

// Category card with its photo (home slider + categories page).
export default function CategoryCard({ category, hidden = false }) {
  const { t, tr } = useApp()
  const { products } = useStore()
  const count = products.filter((p) => p.categoryId === category.id).length
  return (
    <Link
      to={`/categories/${category.id}`}
      className="cat-card"
      aria-hidden={hidden || undefined}
      tabIndex={hidden ? -1 : undefined}
    >
      <Photo src={category.image} alt="" className="cat-card__img" />
      <span className="cat-card__shade" />
      <span className="cat-card__body">
        <span className="cat-card__name">{tr(category.name)}</span>
        <span className="cat-card__cta">{count} {t('common.items')}</span>
      </span>
    </Link>
  )
}
