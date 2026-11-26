import { useState } from 'react'
import { useApp } from '../../src/AppContext.js'
import { useStore } from '../../src/StoreContext.js'
import ImageField from './ImageField.jsx'
import Photo from '../Photo.jsx'

const blank = () => ({ id: null, image: '', name: { en: '', ar: '' } })

export default function AdminCategories() {
  const { t, tr, notify } = useApp()
  const { categories, products, saveCategory, deleteCategory } = useStore()
  const [draft, setDraft] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    const r = await saveCategory(draft)
    setBusy(false)
    if (!r.ok) return setError(t(r.error))
    notify(t('toast.saved'))
    setDraft(null)
  }

  const remove = async (c) => {
    if (!window.confirm(t('common.confirmDelete'))) return
    const r = await deleteCategory(c.id)
    if (!r.ok) notify(t(r.error), 'error')
  }

  return (
    <>
      {!draft && (
        <p><button className="btn btn--primary" onClick={() => { setError(''); setDraft(blank()) }}>+ {t('c.add')}</button></p>
      )}

      {draft && (
        <form className="card form admin__form" onSubmit={submit}>
          <h3>{draft.id ? t('c.edit') : t('c.add')}</h3>
          <ImageField label={t('c.photo')} value={draft.image} onChange={(image) => setDraft({ ...draft, image })} />
          <div className="form__row">
            <label>{t('c.nameEn')}
              <input value={draft.name.en} onChange={(e) => setDraft({ ...draft, name: { ...draft.name, en: e.target.value } })} required />
            </label>
            <label>{t('c.nameAr')}
              <input value={draft.name.ar} dir="rtl" onChange={(e) => setDraft({ ...draft, name: { ...draft.name, ar: e.target.value } })} />
            </label>
          </div>
          {error && <p className="form__error" role="alert">{error}</p>}
          <div className="row-gap">
            <button className="btn btn--primary" type="submit" disabled={busy}>{busy ? '…' : t('common.save')}</button>
            <button className="btn btn--outline" type="button" onClick={() => setDraft(null)}>{t('common.cancel')}</button>
          </div>
        </form>
      )}

      <div className="table-wrap card">
        <table>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id}>
                <td><Photo src={c.image} alt="" className="photo-box--thumb" /></td>
                <td><b>{tr(c.name)}</b></td>
                <td className="muted">{products.filter((p) => p.categoryId === c.id).length} {t('common.items')}</td>
                <td className="actions">
                  <button className="link-btn" onClick={() => { setError(''); setDraft(c) }}>{t('common.edit')}</button>
                  <button className="link-btn link-btn--danger" onClick={() => remove(c)}>{t('common.delete')}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
