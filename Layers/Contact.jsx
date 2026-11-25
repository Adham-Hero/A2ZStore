import { useState } from 'react'
import { useApp } from '../src/AppContext.js'
import { contactInfo } from '../src/data.js'
import Icon from './Icons.jsx'

export default function Contact() {
  const { t } = useApp()
  const [sent, setSent] = useState(false)

  // No backend yet: connect this to your API / email service.
  const submit = (e) => {
    e.preventDefault()
    setSent(true)
    e.currentTarget.reset()
  }

  return (
    <section id="contact" className="section section--alt">
      <div className="container contact">
        <div>
          <h2>{t('contact.title')}</h2>
          <p>{t('contact.subtitle')}</p>
          <ul className="contact__list">
            <li><Icon name="phone" /><span><b>{t('contact.phone')}</b><bdi dir="ltr">{contactInfo.phone}</bdi></span></li>
            <li><Icon name="mail" /><span><b>{t('contact.mail')}</b><bdi dir="ltr">{contactInfo.email}</bdi></span></li>
            <li><Icon name="pin" /><span><b>{t('contact.address')}</b>{t('contact.addressValue')}</span></li>
          </ul>
        </div>

        <form className="card form" onSubmit={submit}>
          <label>
            {t('contact.name')}
            <input name="name" type="text" required autoComplete="name" />
          </label>
          <label>
            {t('contact.email')}
            <input name="email" type="email" required autoComplete="email" />
          </label>
          <label>
            {t('contact.message')}
            <textarea name="message" rows="4" required />
          </label>
          <button className="btn btn--primary" type="submit">{t('contact.send')}</button>
          {sent && <p className="form__ok" role="status">{t('contact.thanks')}</p>}
        </form>
      </div>
    </section>
  )
}
