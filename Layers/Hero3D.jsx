import { useEffect, useRef } from 'react'
import { useApp } from '../src/AppContext.js'
import Logo3D from './Logo3D.jsx'

// 3D banner for the hero: a floating Z2A logo with depth, an orbiting ring, glow and sparkles.
// It leans toward the mouse pointer (disabled when the visitor prefers reduced motion).
export default function Hero3D() {
  const { t } = useApp()
  const tilt = useRef(null)

  useEffect(() => {
    const el = tilt.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0
    const onMove = (e) => {
      const r = el.getBoundingClientRect()
      tx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2)))
      ty = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (window.innerHeight / 2)))
    }
    const loop = () => {
      cx += (tx - cx) * 0.07
      cy += (ty - cy) * 0.07
      el.style.setProperty('--ry', `${(cx * 24).toFixed(2)}deg`)
      el.style.setProperty('--rx', `${(-cy * 18).toFixed(2)}deg`)
      raf = requestAnimationFrame(loop)
    }
    window.addEventListener('pointermove', onMove)
    raf = requestAnimationFrame(loop)
    return () => {
      window.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div className="h3d" aria-hidden="true">
      <div className="h3d__tilt" ref={tilt}>
        <div className="h3d__float">
          <span className="h3d__glow" />
          <span className="h3d__disc" />
          <span className="h3d__ring" />
          <span className="h3d__orbit"><i /></span>
          <span className="h3d__orbit h3d__orbit--b"><i /></span>
          <div className="h3d__mark"><Logo3D /></div>
          <span className="h3d__tag">{t('tagline')}</span>
          {Array.from({ length: 7 }, (_, i) => <span key={i} className={`h3d__spark h3d__spark--${i + 1}`} />)}
        </div>
        <span className="h3d__shadow" />
      </div>
    </div>
  )
}
