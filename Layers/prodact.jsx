import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../src/AppContext.js'
import { useStore } from '../src/StoreContext.js'
import { discountOf, isInStock } from '../src/helpers.js'
import ProductCard, { ProductMedia } from './prodectscard.jsx'

// Item page: /product/:id
export default function Prodact() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t, tr, money, notify } = useApp()
  const { products, categories, addToCart, ready } = useStore()
  const [qty, setQty] = useState(1)

  const product = products.find((p) => p.id === id)
  if (!ready) return <div className="container loading" role="status" aria-label={t('common.loading')} />
  if (!product) {
    return (
      <section className="section">
        <div className="container empty">
          <p>{t('product.notFound')}</p>
          <Link to="/shop" className="btn btn--primary">{t('nav.shop')}</Link>
        </div>
      </section>
    )
  }

  const category = categories.find((c) => c.id === product.categoryId)
  const off = discountOf(product)
  const inStock = isInStock(product)
  const related = products.filter((p) => p.categoryId === product.categoryId && p.id !== product.id).slice(0, 4)

  const add = (goCheckout) => {
    const r = addToCart(product.id, qty)
    notify(r.ok ? t('toast.added') : t(r.error), r.ok ? 'ok' : 'error')
    if (r.ok && goCheckout) navigate('/checkout')
  }

  return (
    <section className="section">
      <div className="container">
        <Link to={category ? `/categories/${category.id}` : '/shop'} className="back-link">
          ← {category ? tr(category.name) : t('nav.shop')}
        </Link>

        <div className="pdp">
          <ProductMedia product={product} className="photo-box--lg" />

          <div className="pdp__info">
            <h1>{tr(product.name)}</h1>
            <div className="offer__prices offer__prices--lg">
              <strong>{money(product.price)}</strong>
              {off > 0 && (
                <>
                  <s>{money(product.oldPrice)}</s>
                  <span className="offer__tag offer__tag--inline">{off}% {t('offers.off')}</span>
                </>
              )}
            </div>
            {off > 0 && <p className="save">{t('common.save2', { n: money(product.oldPrice - product.price) })}</p>}

            <p className={`stock ${inStock ? 'is-in' : 'is-out'}`}>
              {inStock
                ? product.stock <= 5 ? t('common.onlyLeft', { n: product.stock }) : t('common.inStock')
                : t('common.outOfStock')}
            </p>

            <p className="pdp__desc">{tr(product.description)}</p>

            {inStock && (
              <div className="pdp__buy">
                <div className="qty qty--lg" aria-label={t('product.qty')}>
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="-">−</button>
                  <span>{qty}</span>
                  <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))} aria-label="+">+</button>
                </div>
                <button className="btn btn--primary" onClick={() => add(false)}>{t('common.add')}</button>
                <button className="btn btn--outline" onClick={() => add(true)}>{t('product.buyNow')}</button>
              </div>
            )}
          </div>
        </div>

        {related.length > 0 && (
          <div className="related">
            <h2>{t('product.related')}</h2>
            <div className="grid">{related.map((p) => <ProductCard key={p.id} product={p} />)}</div>
          </div>
        )}
      </div>
    </section>
  )
}
