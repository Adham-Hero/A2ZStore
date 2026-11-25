import { useApp } from '../src/AppContext.js'
import Logo from './Logo.jsx'
import Categories from './Categories.jsx'
import Offers from './Offers.jsx'
import About from './About.jsx'
import Contact from './Contact.jsx'

// Hero section, then (as the note asks): categories slider, latest offers, contact us.
const Hero = () => {
  const { t, setSignInOpen } = useApp()

  return (
    <>
      <section id="home" className="hero">
        <div className="container hero__inner">
          <div className="hero__text">
            <span className="eyebrow">{t('hero.eyebrow')}</span>
            <h1>{t('hero.title')}</h1>
            <p>{t('hero.subtitle')}</p>
            <div className="hero__actions">
              <a href="#shop" className="btn btn--primary">{t('hero.shop')}</a>
              <button className="btn btn--outline" onClick={() => setSignInOpen(true)}>
                {t('nav.signin')}
              </button>
            </div>
          </div>
          <div className="hero__logo" aria-hidden="true">
            <Logo size={180} showName={false} />
          </div>
        </div>
      </section>

      <Categories />
      <Offers />
      <About />
      <Contact />
    </>
  )
}

export default Hero
