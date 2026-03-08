// src/context/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { isServiceUnavailableError } from '../supabaseClient'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [serviceUnavailable, setServiceUnavailable] = useState(false)

  useEffect(() => {
    let isMounted = true

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id, session.user)
      else {
        setProfile(null)
        setServiceUnavailable(false)
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id, session.user)
      else {
        setProfile(null)
        setIsAdmin(false)
        setServiceUnavailable(false)
        setLoading(false)
      }
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function mergeProfile(dbProfile, authUser) {
    const metadata = authUser?.user_metadata || {}
    return {
      ...(dbProfile || {}),
      full_name: metadata.full_name || '',
      bio: metadata.bio || '',
      location: metadata.location || '',
      website: metadata.website || '',
      avatar_url: metadata.avatar_url || '',
      username: dbProfile?.username || metadata.username || '',
      target_exams: Array.isArray(dbProfile?.target_exams) ? dbProfile.target_exams : [],
      daily_goal: typeof dbProfile?.daily_goal === 'number' ? dbProfile.daily_goal : 10,
      self_assessed_level: dbProfile?.self_assessed_level || null,
      onboarding_completed: Boolean(dbProfile?.onboarding_completed),
    }
  }

  async function fetchProfile(userId, authUser = user) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      if (error && error.code !== 'PGRST116') throw error
      const merged = mergeProfile(data || null, authUser)
      setProfile(merged)
      setIsAdmin(data?.is_admin ?? false)
      setServiceUnavailable(false)
    } catch (err) {
      setProfile(mergeProfile(null, authUser))
      setIsAdmin(false)
      setServiceUnavailable(isServiceUnavailableError(err))
    } finally {
      setLoading(false)
    }
  }

  async function refreshProfile() {
    if (!user?.id) return
    await fetchProfile(user.id, user)
  }

  async function updateProfile({
    username,
    self_assessed_level,
    target_exams,
    daily_goal,
    onboarding_completed,
    full_name,
    bio,
    location,
    website,
    avatar_url,
  }) {
    if (!user?.id) throw new Error('Not authenticated')

    const profilePayload = {
      id: user.id,
      username: username ?? '',
      self_assessed_level: self_assessed_level ?? null,
      target_exams: Array.isArray(target_exams) ? target_exams : [],
      daily_goal: typeof daily_goal === 'number' ? daily_goal : 10,
      onboarding_completed: Boolean(onboarding_completed),
    }

    const metadataPayload = {
      full_name: full_name ?? '',
      bio: bio ?? '',
      location: location ?? '',
      website: website ?? '',
      avatar_url: avatar_url ?? '',
      username: username ?? '',
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .upsert(profilePayload, { onConflict: 'id' })
    if (profileError) throw profileError

    const { data: authData, error: authError } = await supabase.auth.updateUser({
      data: metadataPayload,
    })
    if (authError) throw authError

    if (authData?.user) setUser(authData.user)
    await fetchProfile(user.id, authData?.user || user)
  }

  async function signOut() {
    try {
      // Local sign-out clears session on device even when network/auth edge is unstable.
      const { error } = await supabase.auth.signOut({ scope: 'local' })
      if (error) throw error
    } catch (err) {
      // Ensure UI exits authenticated state even if upstream logout endpoint fails.
      setUser(null)
      setProfile(null)
      setIsAdmin(false)
      setServiceUnavailable(isServiceUnavailableError(err))
    } finally {
      setUser(null)
      setProfile(null)
      setIsAdmin(false)
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ user, profile, isAdmin, loading, serviceUnavailable, signOut, refreshProfile, updateProfile }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
