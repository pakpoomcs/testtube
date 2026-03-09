// src/context/AuthContext.js
// Auth temporarily disabled — returns static guest state to avoid 520 errors.
import { createContext, useContext } from 'react'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  return (
    <AuthContext.Provider value={{
      user: null,
      profile: null,
      isAdmin: false,
      loading: false,
      serviceUnavailable: false,
      signOut: () => {},
      refreshProfile: () => {},
      updateProfile: () => Promise.resolve(),
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
