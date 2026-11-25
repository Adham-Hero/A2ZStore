import { createContext, useContext } from 'react'

// UI state: theme, language, translations, toast, cart drawer, sign-in modal.
export const AppContext = createContext(null)
export const useApp = () => useContext(AppContext)
