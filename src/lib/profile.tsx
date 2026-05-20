import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'
import { supabase } from './supabase'
import { useAuth } from './auth'

export type Profile = {
  id: string
  username: string
  created_at: string
  updated_at: string
}

type ProfileContextValue = {
  profile: Profile | null
  loading: boolean
  refresh: () => Promise<void>
}

const ProfileContext = createContext<ProfileContextValue | undefined>(undefined)

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const { user, loading: authLoading } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const userId = user?.id ?? null

  const fetchProfile = useCallback(async () => {
    if (!userId) {
      setProfile(null)
      setLoading(false)
      return
    }
    setLoading(true)
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, created_at, updated_at')
      .eq('id', userId)
      .maybeSingle()
    if (error) {
      console.error('profile fetch error', error)
      setProfile(null)
    } else {
      setProfile(data as Profile | null)
    }
    setLoading(false)
  }, [userId])

  useEffect(() => {
    if (authLoading) return
    fetchProfile()
  }, [authLoading, fetchProfile])

  return (
    <ProfileContext.Provider value={{ profile, loading, refresh: fetchProfile }}>
      {children}
    </ProfileContext.Provider>
  )
}

export const useProfile = () => {
  const ctx = useContext(ProfileContext)
  if (!ctx) throw new Error('useProfile must be used within ProfileProvider')
  return ctx
}
