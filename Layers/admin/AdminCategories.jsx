import { useState } from 'react'
import { useApp } from '../../src/AppContext.js'
import { useStore } from '../../src/StoreContext.js'

const blank = () => ({ id: null, icon: '🏷️', name: { en: '', ar: '' } })

export default function AdminCategories() {
  const { t, tr, notify } = useApp()
  const { categories, products, saveCategory, deleteCategory } = useStore()
  const [draft, setDraft] = useState(null)
  const [error, setError] = useState('')

  const submit = (e) => {
    e.preventDefault()
    const r = saveCategory(draft)
    if (!r.ok) return setError(t(r.error))
    notify(t('toast.saved'))
    setDraft(null)
  }

  const remove = (c) => {
    if (!window.confirm(t('common.confirmDelete'))) return
    const r = deleteCategory(c.id)
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
          <div className="form__row">
            <label>{t('c.nameEn')}
              <input value={draft.name.en} onChange={(e) => setDraft({ ...draft, name: { ...draft.name, en: e.target.value } })} required />
            </label>
            <label>{t('c.nameAr')}
              <input value={draft.name.ar} dir="rtl" onChange={(e) => setDraft({ ...draft, name: { ...draft.name, ar: e.target.value } })} />
            </label>
          </div>
          <label>{t('c.icon')}
            <input value={draft.icon} maxLength={4} onChange={(e) => setDraft({ ...draft, icon: e.target.value })} />
          </label>
          {error && <p className="form__error" role="alert">{error}</p>}
          <div className="row-gap">
            <button className="btn btn--primary" type="submit">{t('common.save')}</button>
            <button className="btn btn--outline" type="button" onClick={() => setDraft(null)}>{t('common.cancel')}</button>
          </div>
        </form>
      )}

      <div className="table-wrap card">
        <table>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id}>
                <td><span className="thumb">{c.icon}</span></td>
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
