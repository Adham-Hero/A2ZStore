import { useEffect, useState } from 'react'
import { load, save } from './storage.js'

// useState that survives page refreshes (stored in localStorage).
export default function usePersistentState(key, initial) {
  const [value, setValue] = useState(() => {
    const stored = load(key, undefined)
    if (stored !== undefined) return stored
    return typeof initial === 'function' ? initial() : initial
  })
  useEffect(() => {
    save(key, value)
  }, [key, value])
  return [value, setValue]
}
