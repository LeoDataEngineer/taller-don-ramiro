import { createContext, useContext } from 'react'
import { useTaller } from './useTaller'

const TallerContext = createContext(null)

export function TallerProvider({ children }) {
  const store = useTaller()
  return <TallerContext.Provider value={store}>{children}</TallerContext.Provider>
}

export function useTallerStore() {
  const ctx = useContext(TallerContext)
  if (!ctx) throw new Error('useTallerStore must be used inside TallerProvider')
  return ctx
}
