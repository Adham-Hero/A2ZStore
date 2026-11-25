import { useEffect, useState } from 'react'
import { useApp } from '../src/AppContext.js'
import { useStore } from '../src/StoreContext.js'
import Icon from './Icons.jsx'

// The form is mounted only while the modal is open, so it always starts fresh (sign-in mode, no old error).
export default function SignInModal() {
  const { signInOpen } = useApp()
  return signInOpen ? <SignInForm /> : null
}

function SignInForm() {
  const { t, setSignInOpen, notify } = useApp()
  const { users, login, register } = useStore()
  const [mode, setMode] = useState('signin')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setSignInOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setSignInOpen])

  const isRegister = mode === 'register'
  const firstUser = users.length === 0

  const submit = async (e) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    setBusy(true)
    const result = isRegister
      ? await register({ name: f.get('name'), email: f.get('email'), password: f.get('password') })
      : await login({ email: f.get('email'), password: f.get('password') })
    setBusy(false)
    if (!result.ok) return setError(t(result.error))
    setError('')
    setSignInOpen(false)
    notify(result.firstOwner ? t('toast.owner') : t('toast.welcome'))
  }

  const switchMode = () => {
    setError('')
    setMode(isRegister ? 'signin' : 'register')
  }

  return (
    <div className="modal" onClick={() => setSignInOpen(false)}>
      <form
        className="card modal__box form"
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        role="dialog"
        aria-modal="true"
        aria-label={isRegister ? t('auth.register') : t('auth.signin')}
      >
        <button type="button" className="icon-btn modal__close" onClick={() => setSignInOpen(false)} aria-label={t('common.close')}>
          <Icon name="close" />
        </button>
        <h3>{isRegister ? t('auth.register') : t('auth.signin')}</h3>

        {isRegister && (
          <label>{t('auth.name')}
            <input name="name" type="text" required autoComplete="name" />
          </label>
        )}
        <label>{t('auth.email')}
          <input name="email" type="email" required autoComplete="email" dir="ltr" />
        </label>
        <label>{t('auth.password')}
          <input name="password" type="password" required minLength={isRegister ? 6 : undefined}
            autoComplete={isRegister ? 'new-password' : 'current-password'} dir="ltr" />
        </label>

        {isRegister && firstUser && <p className="hint">{t('auth.firstOwner')}</p>}
        {error && <p className="form__error" role="alert">{error}</p>}

        <button className="btn btn--primary" type="submit" disabled={busy}>
          {isRegister ? t('auth.register') : t('auth.signin')}
        </button>
        <button type="button" className="link-btn" onClick={switchMode}>
          {isRegister ? t('auth.toSignin') : t('auth.toRegister')}
        </button>
      </form>
    </div>
  )
}
