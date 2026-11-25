import { createContext, useContext } from 'react'

// Data state: categories, products, users, orders, session, cart.
export const StoreContext = createContext(null)
export const useStore = () => useContext(StoreContext)
