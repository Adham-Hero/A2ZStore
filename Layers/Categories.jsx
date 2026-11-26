import { useEffect, useRef } from 'react'
import { useApp } from '../src/AppContext.js'
import { useStore } from '../src/StoreContext.js'
import Icon from './Icons.jsx'
import CategoryCard from './CategoryCard.jsx'

const GAP = 16
const SPEED = 0.04 // px per millisecond (about 40px per second)

// Home slider. It glides by itself in a seamless loop (the list is repeated),
// pauses while you hover / touch / use the keyboard, and still has arrow buttons + drag/scroll.
export default function Categories() {
  const { t, lang } = useApp()
  const { categories } = useStore()
  const track = useRef(null)
  const paused = useRef(false)
  const resumeTimer = useRef(0)
  const dir = lang === 'ar' ? -1 : 1 // scrollLeft is negative in RTL
  const n = categories.length
  // enough copies of the list so the loop never shows an empty gap (cards are at least ~216px wide)
  const copies = Math.max(3, Math.ceil((2 * 1200) / (Math.max(n, 1) * 216)) + 1)

  useEffect(() => {
    const el = track.current
    if (!el || n === 0) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const setWidth = () => el.scrollWidth / copies
    let pos = setWidth() // start inside the middle copy so we can also scroll backwards
    el.scrollLeft = dir * pos
    let last = performance.now()
    let raf = 0

    const tick = (now) => {
      const dt = Math.min(now - last, 64)
      last = now
      const w = setWidth()
      if (w > 0) {
        const actual = Math.abs(el.scrollLeft)
        if (Math.abs(actual - pos) > 2) pos = actual // the user scrolled / dragged / clicked an arrow
        if (!paused.current && !reduce) pos += SPEED * dt
        if (pos >= 2 * w) pos -= w // keep the position inside the middle copy: the jump is invisible
        else if (pos < w) pos += w
        el.scrollLeft = dir * pos
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [n, copies, dir])

  const pause = () => {
    clearTimeout(resumeTimer.current)
    paused.current = true
  }
  const resume = (delay = 0) => {
    clearTimeout(resumeTimer.current)
    resumeTimer.current = setTimeout(() => { paused.current = false }, delay)
  }
  const slide = (step) => {
    pause()
    const card = track.current?.querySelector('.cat-card')
    track.current?.scrollBy({ left: step * dir * ((card?.offsetWidth ?? 240) + GAP), behavior: 'smooth' })
    resume(2500)
  }

  if (n === 0) return null

  return (
    <section id="categories" className="section">
      <div className="container">
        <div className="section__head">
          <div>
            <h2>{t('cat.title')}</h2>
            <p>{t('cat.subtitle')}</p>
          </div>
          <div className="slider-controls">
            <button className="icon-btn icon-btn--ring" onClick={() => slide(-1)} aria-label={t('cat.prev')}>
              <span className="chev chev--prev"><Icon name="chevron" /></span>
            </button>
            <button className="icon-btn icon-btn--ring" onClick={() => slide(1)} aria-label={t('cat.next')}>
              <span className="chev chev--next"><Icon name="chevron" /></span>
            </button>
          </div>
        </div>

        <div
          className="slider slider--auto"
          ref={track}
          onPointerEnter={pause}
          onPointerLeave={() => resume(400)}
          onTouchStart={pause}
          onTouchEnd={() => resume(2500)}
          onFocus={pause}
          onBlur={() => resume(400)}
        >
          {Array.from({ length: copies }, (_, k) =>
            categories.map((c) => <CategoryCard key={`${k}-${c.id}`} category={c} hidden={k !== 1} />),
          )}
        </div>
      </div>
    </section>
  )
}
