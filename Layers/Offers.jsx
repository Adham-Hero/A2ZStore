import { Link } from 'react-router-dom'
import { useApp } from '../src/AppContext.js'
import { useStore } from '../src/StoreContext.js'
import ProductCard from './prodectscard.jsx'

// Latest offers = newest products that have a price before discount.
export default function Offers() {
  const { t } = useApp()
  const { products } = useStore()
  const deals = products
    .filter((p) => p.oldPrice > p.price)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 4)

  if (deals.length === 0) return null

  return (
    <section id="offers" className="section section--alt">
      <div className="container">
        <div className="section__head">
          <div>
            <h2>{t('offers.title')}</h2>
            <p>{t('offers.subtitle')}</p>
          </div>
          <Link to="/shop" className="btn btn--outline btn--sm">{t('offers.viewAll')}</Link>
        </div>
        <div className="grid">
          {deals.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
    </section>
  )
}
