import { Link } from 'react-router-dom'
import { useApp } from '../src/AppContext.js'
import { useStore } from '../src/StoreContext.js'
import { discountOf, isInStock } from '../src/helpers.js'
import Photo from './Photo.jsx'

// Product photo (or the branded placeholder until a photo is uploaded).
export function ProductMedia({ product, className = '' }) {
  const { tr } = useApp()
  return <Photo src={product.image} alt={tr(product.name)} className={className} />
}

// Product card with two buttons: View (item page) and Add to cart.
export default function ProductCard({ product }) {
  const { t, tr, money, notify } = useApp()
  const { addToCart } = useStore()
  const off = discountOf(product)
  const inStock = isInStock(product)

  const add = () => {
    const r = addToCart(product.id)
    notify(r.ok ? t('toast.added') : t(r.error), r.ok ? 'ok' : 'error')
  }

  return (
    <article className="offer">
      <Link to={`/product/${product.id}`} className="offer__img" aria-label={tr(product.name)}>
        <ProductMedia product={product} />
        {off > 0 && <span className="offer__tag">{off}% {t('offers.off')}</span>}
        {!inStock && <span className="offer__tag offer__tag--out">{t('common.outOfStock')}</span>}
      </Link>
      <h3>{tr(product.name)}</h3>
      <div className="offer__prices">
        <strong>{money(product.price)}</strong>
        {off > 0 && <s>{money(product.oldPrice)}</s>}
      </div>
      <div className="offer__actions">
        <Link to={`/product/${product.id}`} className="btn btn--outline btn--sm">{t('common.view')}</Link>
        <button className="btn btn--primary btn--sm" onClick={add} disabled={!inStock}>
          {t('common.add')}
        </button>
      </div>
    </article>
  )
}
