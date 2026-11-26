import { useState } from 'react'
import { useApp } from '../../src/AppContext.js'
import { useStore } from '../../src/StoreContext.js'
import { LOW_STOCK } from '../../src/data.js'
import { isInStock } from '../../src/helpers.js'
import ImageField from './ImageField.jsx'
import Photo from '../Photo.jsx'

const blank = (categoryId = '') => ({
  id: null, categoryId, image: '', available: true,
  name: { en: '', ar: '' }, description: { en: '', ar: '' },
  price: '', oldPrice: '', stock: '0',
})

export default function AdminProducts() {
  const { t, tr, money, notify } = useApp()
  const { products, categories, saveProduct, deleteProduct, saveCategory } = useStore()
  const [draft, setDraft] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [newCat, setNewCat] = useState(null) // null = closed, string = typing

  const set = (patch) => setDraft((d) => ({ ...d, ...patch }))
  const setLang = (field, lang, value) => setDraft((d) => ({ ...d, [field]: { ...d[field], [lang]: value } }))

  const startAdd = () => { setError(''); setDraft(blank(categories[0]?.id)) }
  const startEdit = (p) => {
    setError('')
    setDraft({ ...p, price: String(p.price), oldPrice: p.oldPrice ? String(p.oldPrice) : '', stock: String(p.stock) })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const addCategory = async () => {
    if (!newCat?.trim()) return
    const r = await saveCategory({ id: null, image: '', name: { en: newCat.trim(), ar: newCat.trim() } })
    if (r.ok) {
      set({ categoryId: r.id })
      setNewCat(null)
    } else notify(t(r.error), 'error')
  }

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    const r = await saveProduct({
      ...draft,
      price: Number(draft.price),
      oldPrice: draft.oldPrice === '' ? null : Number(draft.oldPrice),
      stock: Number(draft.stock),
    })
    setBusy(false)
    if (!r.ok) return setError(t(r.error))
    notify(t('toast.saved'))
    setDraft(null)
  }

  const remove = async (p) => {
    if (!window.confirm(t('common.confirmDelete'))) return
    const r = await deleteProduct(p.id)
    if (!r.ok) notify(t(r.error), 'error')
  }

  return (
    <>
      {!draft && (
        <p><button className="btn btn--primary" onClick={startAdd} disabled={categories.length === 0}>+ {t('p.add')}</button></p>
      )}

      {draft && (
        <form className="card form admin__form" onSubmit={submit}>
          <h3>{draft.id ? t('p.edit') : t('p.add')}</h3>

          <ImageField label={t('p.photo')} value={draft.image} onChange={(image) => set({ image })} />

          <div className="form__row">
            <label>{t('p.nameEn')}
              <input value={draft.name.en} onChange={(e) => setLang('name', 'en', e.target.value)} required />
            </label>
            <label>{t('p.nameAr')}
              <input value={draft.name.ar} onChange={(e) => setLang('name', 'ar', e.target.value)} dir="rtl" />
            </label>
          </div>

          <div className="form__row">
            <label>{t('p.descEn')}
              <textarea rows="3" value={draft.description.en} onChange={(e) => setLang('description', 'en', e.target.value)} />
            </label>
            <label>{t('p.descAr')}
              <textarea rows="3" value={draft.description.ar} onChange={(e) => setLang('description', 'ar', e.target.value)} dir="rtl" />
            </label>
          </div>

          <div className="form__row">
            <label>{t('p.category')}
              <select value={draft.categoryId} onChange={(e) => set({ categoryId: e.target.value })} required>
                {categories.map((c) => <option key={c.id} value={c.id}>{tr(c.name)}</option>)}
              </select>
              {newCat === null ? (
                <button type="button" className="link-btn" onClick={() => setNewCat('')}>{t('p.newCat')}</button>
              ) : (
                <span className="inline-add">
                  <input autoFocus placeholder={t('p.newCatName')} value={newCat} onChange={(e) => setNewCat(e.target.value)} />
                  <button type="button" className="btn btn--primary btn--sm" onClick={addCategory}>{t('common.save')}</button>
                </span>
              )}
            </label>
            <label>{t('p.stock')}
              <input type="number" min="0" step="1" value={draft.stock} onChange={(e) => set({ stock: e.target.value })} required />
            </label>
          </div>

          <div className="form__row">
            <label>{t('p.price')}
              <input type="number" min="0" step="any" value={draft.price} onChange={(e) => set({ price: e.target.value })} required />
            </label>
            <label>{t('p.oldPrice')}
              <input type="number" min="0" step="any" value={draft.oldPrice} onChange={(e) => set({ oldPrice: e.target.value })} />
              <small>{t('p.oldPriceHint')}</small>
            </label>
          </div>

          <label className="check">
            <input type="checkbox" checked={draft.available} onChange={(e) => set({ available: e.target.checked })} />
            {t('p.available')}
          </label>

          {error && <p className="form__error" role="alert">{error}</p>}
          <div className="row-gap">
            <button className="btn btn--primary" type="submit" disabled={busy}>{busy ? '…' : t('common.save')}</button>
            <button className="btn btn--outline" type="button" onClick={() => setDraft(null)}>{t('common.cancel')}</button>
          </div>
        </form>
      )}

      <div className="table-wrap card">
        <table>
          <thead>
            <tr>
              <th>{t('p.photo')}</th><th>{t('p.nameEn')}</th><th>{t('p.category')}</th>
              <th>{t('p.price')}</th><th>{t('p.stock')}</th><th>{t('p.status')}</th><th />
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const cat = categories.find((c) => c.id === p.categoryId)
              const inStock = isInStock(p)
              return (
                <tr key={p.id}>
                  <td><Photo src={p.image} alt="" className="photo-box--thumb" /></td>
                  <td><b>{tr(p.name)}</b></td>
                  <td>{cat ? tr(cat.name) : '—'}</td>
                  <td>
                    {money(p.price)}
                    {p.oldPrice > p.price && <><br /><s className="muted">{money(p.oldPrice)}</s></>}
                  </td>
                  <td className={p.stock <= LOW_STOCK ? 'warn' : ''}>{p.stock}</td>
                  <td>
                    <span className={`status ${inStock ? 'status--delivered' : 'status--cancelled'}`}>
                      {inStock ? t('common.inStock') : t('common.outOfStock')}
                    </span>
                  </td>
                  <td className="actions">
                    <button className="link-btn" onClick={() => startEdit(p)}>{t('common.edit')}</button>
                    <button className="link-btn link-btn--danger" onClick={() => remove(p)}>{t('common.delete')}</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}
