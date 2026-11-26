import { useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { useApp } from '../src/AppContext.js'
import { useStore } from '../src/StoreContext.js'
import Logo3D from './Logo3D.jsx'

// Only allow redirects to pages of this website.
const safeNext = (n) => (typeof n === 'string' && n.startsWith('/') && !n.startsWith('//') && !/^\/(login|register)/.test(n) ? n : '/')

// Separate pages: /login and /register  (opened from the "Sign in" buttons)
export default function Auth({ mode }) {
  const { t, notify } = useApp()
  const { user, login, register } = useStore()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const next = safeNext(params.get('next'))
  const isRegister = mode === 'register'
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [show, setShow] = useState(false)

  if (user) return <Navigate to={next} replace />

  const qs = next === '/' ? '' : `?next=${encodeURIComponent(next)}`

  const submit = async (e) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    setBusy(true)
    const r = isRegister
      ? await register({ name: f.get('name'), email: f.get('email'), password: f.get('password') })
      : await login({ email: f.get('email'), password: f.get('password') })
    setBusy(false)
    if (!r.ok) return setError(t(r.error))
    notify(r.firstOwner ? t('toast.owner') : t('toast.welcome'))
    navigate(next, { replace: true })
  }

  return (
    <section className="auth">
      <aside className="auth__side">
        <div className="auth__logo"><Logo3D layers={16} depth={1.6} /></div>
        <h2>{t('tagline')}</h2>
        <ul>
          <li>{t('auth.side1')}</li>
          <li>{t('auth.side2')}</li>
          <li>{t('auth.side3')}</li>
        </ul>
      </aside>

      <div className="auth__main">
        <form className="auth__card form" onSubmit={submit} noValidate={false}>
          <h1>{isRegister ? t('auth.registerTitle') : t('auth.loginTitle')}</h1>
          <p className="muted">{isRegister ? t('auth.registerSub') : t('auth.loginSub')}</p>

          {isRegister && (
            <label>{t('auth.name')}
              <input name="name" type="text" required maxLength={80} autoComplete="name" />
            </label>
          )}
          <label>{t('auth.email')}
            <input name="email" type="email" required autoComplete="email" dir="ltr" />
          </label>
          <label>{t('auth.password')}
            <span className="pw">
              <input name="password" type={show ? 'text' : 'password'} required minLength={isRegister ? 6 : undefined}
                maxLength={72} autoComplete={isRegister ? 'new-password' : 'current-password'} dir="ltr" />
              <button type="button" className="link-btn" onClick={() => setShow((s) => !s)}>
                {show ? t('auth.hide') : t('auth.show')}
              </button>
            </span>
          </label>

          {error && <p className="form__error" role="alert">{error}</p>}

          <button className="btn btn--primary btn--block" type="submit" disabled={busy}>
            {busy ? '…' : isRegister ? t('auth.register') : t('auth.signin')}
          </button>

          <p className="auth__switch">
            {isRegister ? t('auth.haveAccount') : t('auth.noAccount')}{' '}
            <Link to={`${isRegister ? '/login' : '/register'}${qs}`}>{isRegister ? t('auth.signin') : t('auth.register')}</Link>
          </p>
        </form>
      </div>
    </section>
  )
}
