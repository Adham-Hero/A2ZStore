// Logo images live in public/Img/ (cropped from public/Img/logo.png).
//   logo-mark.png  -> "Z2A" only (navbar, footer)
//   logo-badge.png -> circle + tagline (hero)
// They are used as a mask, so the logo takes the current text colour: navy on light, ivory on dark.
const MARK_RATIO = 2.408

export default function Logo({ variant = 'mark', height = 34 }) {
  const src = `${import.meta.env.BASE_URL}Img/logo-${variant}.png`
  const style = {
    WebkitMaskImage: `url(${src})`,
    maskImage: `url(${src})`,
    ...(variant === 'mark' ? { height, aspectRatio: MARK_RATIO } : {}),
  }
  return <span className={`logo logo--${variant}`} role="img" aria-label="Z2A" style={style} />
}
