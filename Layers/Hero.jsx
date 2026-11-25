import { Link } from 'react-router-dom'
import { useApp } from '../src/AppContext.js'
import { useStore } from '../src/StoreContext.js'
import Logo from './Logo.jsx'
import Categories from './Categories.jsx'
import Offers from './Offers.jsx'
import About from './About.jsx'
import Contact from './Contact.jsx'

// Home page: hero, categories slider, latest offers, about, contact.
// (Logo comes from public/Img, font is the San Francisco system stack: see src/index.css)
const Hero = () => {
  const { t, setSignInOpen } = useApp()
  const { user } = useStore()

  return (
    <>
      <section id="home" className="hero">
        <div className="container hero__inner">
          <div className="hero__text">
            <span className="eyebrow">{t('tagline')}</span>
            <h1>{t('hero.title')}</h1>
            <p>{t('hero.subtitle')}</p>
            <div className="hero__actions">
              <Link to="/shop" className="btn btn--primary">{t('hero.shop')}</Link>
              {!user && (
                <button className="btn btn--outline" onClick={() => setSignInOpen(true)}>
                  {t('nav.signin')}
                </button>
              )}
            </div>
          </div>
          <div className="hero__logo" aria-hidden="true">
            <Logo variant="badge" />
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
