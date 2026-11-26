import { useEffect, useState } from 'react'
import { useApp } from '../src/AppContext.js'
import Logo3D from './Logo3D.jsx'

const KEY = 'z2a:welcomed'
const SHOW_MS = 3300   // how long the animation plays
const LEAVE_MS = 800   // fade-out

// "Welcome to Z2A" intro in 3D. Plays once per visit (per browser tab); click anywhere to skip.
export default function Welcome() {
  const { t } = useApp()
  const [phase, setPhase] = useState(() => {
    const seen = sessionStorage.getItem(KEY)
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    return seen || reduce ? 'done' : 'show'
  })

  useEffect(() => {
    if (phase === 'done') return
    document.documentElement.classList.add('no-scroll')
    const timers = []
    if (phase === 'show') timers.push(setTimeout(() => setPhase('leave'), SHOW_MS))
    if (phase === 'leave') {
      timers.push(setTimeout(() => {
        sessionStorage.setItem(KEY, '1')
        setPhase('done')
      }, LEAVE_MS))
    }
    return () => {
      timers.forEach(clearTimeout)
      document.documentElement.classList.remove('no-scroll')
    }
  }, [phase])

  if (phase === 'done') return null

  return (
    <div
      className={`welcome ${phase === 'leave' ? 'is-leaving' : ''}`}
      onClick={() => setPhase('leave')}
      role="presentation"
    >
      <div className="welcome__beams" />
      <div className="welcome__stars">
        {Array.from({ length: 22 }, (_, i) => <i key={i} style={{ '--i': i, left: `${(i * 53 + 7) % 100}%`, top: `${(i * 37 + 11) % 100}%` }} />)}
      </div>
      <div className="welcome__stage">
        <p className="welcome__to">{t('welcome.to')}</p>
        <div className="welcome__logo">
          <Logo3D layers={22} depth={2.4} />
        </div>
        <p className="welcome__tag">{t('tagline')}</p>
      </div>
      <span className="welcome__skip">{t('welcome.skip')}</span>
    </div>
  )
}
