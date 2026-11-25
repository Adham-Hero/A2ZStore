import { useApp } from '../src/AppContext.js'
import { contactInfo } from '../src/data.js'
import Icon from './Icons.jsx'
import Logo from './Logo.jsx'

// Social media icons, copyright, e-mail and phone number.
const socials = [
  ['facebook', 'Facebook', 'https://facebook.com/'],
  ['instagram', 'Instagram', 'https://instagram.com/'],
  ['x', 'X', 'https://x.com/'],
  ['whatsapp', 'WhatsApp', 'https://wa.me/201000000000'],
]

const Foot = () => {
  const { t } = useApp()
  return (
    <footer className="foot">
      <div className="container foot__inner">
        <Logo size={36} />

        <div className="foot__contact">
          <a href={`mailto:${contactInfo.email}`}><Icon name="mail" size={18} /><bdi dir="ltr">{contactInfo.email}</bdi></a>
          <a href={`tel:${contactInfo.phone.replace(/\s/g, '')}`}><Icon name="phone" size={18} /><bdi dir="ltr">{contactInfo.phone}</bdi></a>
        </div>

        <div className="foot__social" aria-label={t('foot.follow')}>
          {socials.map(([icon, label, href]) => (
            <a key={icon} href={href} target="_blank" rel="noreferrer" aria-label={label} className="icon-btn icon-btn--ring">
              <Icon name={icon} />
            </a>
          ))}
        </div>
      </div>
      <p className="foot__copy">
        © {new Date().getFullYear()} {t('brand')}. {t('foot.rights')}
      </p>
    </footer>
  )
}

export default Foot
