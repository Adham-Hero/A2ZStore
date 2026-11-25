import { useApp } from '../src/AppContext.js'

export default function About() {
  const { t } = useApp()
  return (
    <section id="about" className="section">
      <div className="container about">
        <div>
          <h2>{t('about.title')}</h2>
          <p>{t('about.text')}</p>
        </div>
        <ul className="about__points">
          {['about.p1', 'about.p2', 'about.p3'].map((k) => (
            <li key={k}>{t(k)}</li>
          ))}
        </ul>
      </div>
    </section>
  )
}
