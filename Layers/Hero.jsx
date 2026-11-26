import { Link } from 'react-router-dom'
import { useApp } from '../src/AppContext.js'
import { useStore } from '../src/StoreContext.js'
import Hero3D from './Hero3D.jsx'
import Categories from './Categories.jsx'
import Offers from './Offers.jsx'
import About from './About.jsx'
import Contact from './Contact.jsx'

// Home page: hero, categories slider, latest offers, about, contact.
// The 3D logo banner is Layers/Hero3D.jsx (built from public/Img/logo-mark.png).
const Hero = () => {
  const { t } = useApp()
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
              {!user && <Link to="/login" className="btn btn--outline">{t('nav.signin')}</Link>}
            </div>
          </div>
          <div className="hero__logo">
            <Hero3D />
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
