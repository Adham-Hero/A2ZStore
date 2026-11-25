import { useEffect } from 'react'
import { useApp } from '../src/AppContext.js'
import Icon from './Icons.jsx'

export default function SignInModal() {
  const { t, signInOpen, setSignInOpen } = useApp()

  useEffect(() => {
    if (!signInOpen) return
    const onKey = (e) => e.key === 'Escape' && setSignInOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [signInOpen, setSignInOpen])

  if (!signInOpen) return null

  // Placeholder form: connect to your authentication service.
  const submit = (e) => {
    e.preventDefault()
    setSignInOpen(false)
  }

  return (
    <div className="modal" onClick={() => setSignInOpen(false)}>
      <form className="card modal__box form" onClick={(e) => e.stopPropagation()} onSubmit={submit} role="dialog" aria-modal="true" aria-label={t('signin.title')}>
        <button type="button" className="icon-btn modal__close" onClick={() => setSignInOpen(false)} aria-label={t('signin.close')}>
          <Icon name="close" />
        </button>
        <h3>{t('signin.title')}</h3>
        <label>
          {t('signin.email')}
          <input type="email" required autoComplete="email" />
        </label>
        <label>
          {t('signin.password')}
          <input type="password" required autoComplete="current-password" />
        </label>
        <button className="btn btn--primary" type="submit">{t('signin.submit')}</button>
      </form>
    </div>
  )
}
