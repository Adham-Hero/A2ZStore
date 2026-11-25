import { Link } from 'react-router-dom'
import { useApp } from '../src/AppContext.js'

export default function NotFound() {
  const { t } = useApp()
  return (
    <section className="section">
      <div className="container empty">
        <h1>404</h1>
        <h2>{t('nf.title')}</h2>
        <p>{t('nf.text')}</p>
        <Link to="/" className="btn btn--primary">{t('nf.home')}</Link>
      </div>
    </section>
  )
}
