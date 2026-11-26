import Logo from './Logo.jsx'

// One place for every picture on the site (products, categories, thumbnails).
// With a photo it shows the photo; without one it shows the Z2A logo on a branded background.
export default function Photo({ src, alt = '', className = '' }) {
  return (
    <div className={`photo-box ${className}`}>
      {src ? (
        <img src={src} alt={alt} loading="lazy" decoding="async" />
      ) : (
        <span className="photo-box__ph" aria-hidden="true"><Logo height={20} /></span>
      )}
    </div>
  )
}
