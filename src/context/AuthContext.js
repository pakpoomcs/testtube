// src/context/AuthContext.js
import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase, isServiceUnavailableError } from '../supabaseClient'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [serviceUnavailable, setServiceUnavailable] = useState(false)

  // ── Fetch profile row from Supabase ──
  const fetchProfile = useCallback(async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      if (error) throw error
      setProfile(data)
      setIsAdmin(data?.is_admin === true)
      setServiceUnavailable(false)
    } catch (err) {
      console.error('fetchProfile error:', err)
      if (isServiceUnavailableError(err)) {
        setServiceUnavailable(true)
      }
      setProfile(null)
      setIsAdmin(false)
    }
  }, [])

  // ── Listen to Supabase auth state changes ──
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        const u = session?.user ?? null
        setUser(u)
        if (u) {
          fetchProfile(u.id)
        }
        setLoading(false)
      })
      .catch((err) => {
        console.error('getSession error:', err)
        if (isServiceUnavailableError(err)) setServiceUnavailable(true)
        setLoading(false)
      })

    // Subscribe to future changes (sign in, sign out, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const u = session?.user ?? null
        setUser(u)
        if (u) {
          fetchProfile(u.id)
        } else {
          setProfile(null)
          setIsAdmin(false)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [fetchProfile])

  // ── Public helpers ──
  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setIsAdmin(false)
  }, [])

  const refreshProfile = useCallback(async () => {
    if (user?.id) await fetchProfile(user.id)
  }, [user, fetchProfile])

  const updateProfile = useCallback(async (updates) => {
    if (!user?.id) return
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
    if (error) throw error
    // Re-fetch to get the merged row
    await fetchProfile(user.id)
  }, [user, fetchProfile])

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      isAdmin,
      loading,
      serviceUnavailable,
      signOut,
      refreshProfile,
      updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
