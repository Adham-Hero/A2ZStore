import { useApp } from '../src/AppContext.js'
import { offers } from '../src/data.js'

export default function Offers() {
  const { t, tr, money, addToCart } = useApp()

  return (
    <section id="shop" className="section section--alt">
      <div className="container">
        <div className="section__head">
          <div>
            <h2>{t('offers.title')}</h2>
            <p>{t('offers.subtitle')}</p>
          </div>
        </div>

        <div className="grid">
          {offers.map((o) => {
            const off = Math.round((1 - o.price / o.old) * 100)
            const label = tr(o.name)
            return (
              <article key={o.id} className="offer">
                <div className="offer__img">
                  <span className="offer__tag">
                    {off}% {t('offers.off')}
                  </span>
                  <span className="offer__icon" aria-hidden="true">{o.icon}</span>
                </div>
                <h3>{label}</h3>
                <div className="offer__prices">
                  <strong>{money(o.price)}</strong>
                  <s>{money(o.old)}</s>
                </div>
                <button
                  className="btn btn--primary btn--block"
                  onClick={() => addToCart({ id: o.id, icon: o.icon, name: label, price: o.price })}
                >
                  {t('offers.add')}
                </button>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
