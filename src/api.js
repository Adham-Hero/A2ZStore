// Talks to the Node/MongoDB server (everything under /api). Errors carry an i18n key in `error.key`.
async function request(method, path, body, form) {
  let res
  try {
    res = await fetch(`/api${path}`, {
      method,
      credentials: 'same-origin',
      headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: form ?? (body !== undefined ? JSON.stringify(body) : undefined),
    })
  } catch {
    throw Object.assign(new Error('network'), { key: 'err.network' })
  }
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    const key = data?.error || 'err.server'
    throw Object.assign(new Error(key), { key, status: res.status })
  }
  return data
}

export const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body ?? {}),
  put: (path, body) => request('PUT', path, body),
  patch: (path, body) => request('PATCH', path, body),
  delete: (path) => request('DELETE', path),
  upload: (blob, name = 'photo.jpg') => {
    const form = new FormData()
    form.append('file', blob, name)
    return request('POST', '/uploads', undefined, form)
  },
}
