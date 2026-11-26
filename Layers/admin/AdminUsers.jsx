import { useEffect } from 'react'
import { useApp } from '../../src/AppContext.js'
import { useStore } from '../../src/StoreContext.js'
import { ROLES } from '../../src/data.js'

export default function AdminUsers() {
  const { t, formatDate, notify } = useApp()
  const { users, user: me, isOwner, setUserRole, deleteUser, refreshUsers } = useStore()

  useEffect(() => {
    refreshUsers()
  }, [refreshUsers])

  const changeRole = async (u, role) => {
    const r = await setUserRole(u.id, role)
    notify(r.ok ? t('toast.saved') : t(r.error), r.ok ? 'ok' : 'error')
  }
  const remove = async (u) => {
    if (!window.confirm(t('common.confirmDelete'))) return
    const r = await deleteUser(u.id)
    if (!r.ok) notify(t(r.error), 'error')
  }

  return (
    <>
      <p className="muted">{t('u.help')}</p>
      <div className="table-wrap card">
        <table>
          <thead>
            <tr>
              <th>{t('auth.name')}</th><th>{t('auth.email')}</th><th>{t('u.role')}</th><th>{t('u.joined')}</th><th />
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const self = u.id === me.id
              return (
                <tr key={u.id}>
                  <td><b>{u.name}</b> {self && <span className="status status--confirmed">{t('u.you')}</span>}</td>
                  <td dir="ltr">{u.email}</td>
                  <td>
                    {isOwner && !self ? (
                      <select className="status-select" value={u.role} onChange={(e) => changeRole(u, e.target.value)} aria-label={t('u.role')}>
                        {ROLES.map((r) => <option key={r} value={r}>{t(`u.role.${r}`)}</option>)}
                      </select>
                    ) : (
                      <span className={`role role--${u.role}`}>{t(`u.role.${u.role}`)}</span>
                    )}
                  </td>
                  <td>{formatDate(u.createdAt)}</td>
                  <td className="actions">
                    {isOwner && !self && (
                      <button className="link-btn link-btn--danger" onClick={() => remove(u)}>{t('common.delete')}</button>
                    )}
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
