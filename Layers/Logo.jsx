import logo from '../src/assets/logo.svg'
import { useApp } from '../src/AppContext.js'

// Replace src/assets/logo.svg with your real logo: it updates everywhere.
export default function Logo({ size = 40, showName = true }) {
  const { t } = useApp()
  return (
    <span className="logo">
      <img src={logo} width={size} height={size} alt="" />
      {showName && <span className="logo__name">{t('brand')}</span>}
    </span>
  )
}
