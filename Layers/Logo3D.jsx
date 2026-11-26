// The Z2A logo as a real 3D object: the logo image is stacked in many thin layers (CSS 3D)
// so it has thickness. Used in the welcome animation and in the hero.
const BASE = import.meta.env.BASE_URL
const MARK = `${BASE}Img/logo-mark.png`

// colour of each layer: dark bronze at the back -> champagne gold -> ivory front face
const hex = (n) => Math.round(n).toString(16).padStart(2, '0')
const mix = (a, b, t) => `#${[0, 1, 2].map((i) => hex(parseInt(a.slice(1 + i * 2, 3 + i * 2), 16) * (1 - t) + parseInt(b.slice(1 + i * 2, 3 + i * 2), 16) * t)).join('')}`

export default function Logo3D({ layers = 18, depth = 1.7, className = '' }) {
  return (
    <div className={`l3d ${className}`} aria-hidden="true">
      {Array.from({ length: layers }, (_, i) => {
        const t = i / (layers - 1) // 0 = back, 1 = front
        const front = i === layers - 1
        return (
          <span
            key={i}
            className="l3d__layer"
            style={{
              transform: `translateZ(${(t - 0.5) * layers * depth}px)`,
              backgroundColor: front ? '#f7f5f0' : mix('#4a3b25', '#c5a880', t),
              WebkitMaskImage: `url(${MARK})`,
              maskImage: `url(${MARK})`,
            }}
          />
        )
      })}
    </div>
  )
}
