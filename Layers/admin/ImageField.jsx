import { useState } from 'react'
import { useApp } from '../../src/AppContext.js'
import { useStore } from '../../src/StoreContext.js'
import Photo from '../Photo.jsx'

// Photo picker used for products and categories: choose a file -> it is resized and uploaded to the server.
export default function ImageField({ label, value, onChange }) {
  const { t, notify } = useApp()
  const { uploadImage } = useStore()
  const [busy, setBusy] = useState(false)

  const pick = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setBusy(true)
    const r = await uploadImage(file)
    setBusy(false)
    if (r.ok) onChange(r.url)
    else notify(t(r.error), 'error')
  }

  return (
    <div className="photo">
      <div className="photo__preview"><Photo src={value} alt="" /></div>
      <div>
        <b>{label}</b>
        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={pick} disabled={busy} />
        <small>{busy ? t('common.uploading') : t('p.photoHint')}</small>
        {value && <button type="button" className="link-btn" onClick={() => onChange('')}>{t('p.removePhoto')}</button>}
      </div>
    </div>
  )
}
