import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { Profile, Subscription } from '@khmer-horror/shared'
import { isSubscriptionActive } from '@khmer-horror/shared'

interface AuthContextType {
  user: User | null
  profile: Profile | null
  subscription: Subscription | null
  hasActiveSubscription: boolean
  isAdmin: boolean
  isLoading: boolean
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: Error | null }>
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  updateProfile: (data: Partial<Profile>) => Promise<{ error: Error | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const loadUserData = useCallback(async (userId: string) => {
    if (!isSupabaseConfigured) {
      // Demo guest user
      setProfile({
        id: userId,
        display_name: 'អ្នកស្ដាប់សាកល្បង',
        avatar_url: null,
        role: 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      setIsLoading(false)
      return
    }

    try {
      // Load profile
      const { data: prof, error: profErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (!profErr && prof) {
        setProfile(prof as Profile)
      }

      // Load active subscription
      const { data: subs, error: subErr } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)

      if (!subErr && subs && subs.length > 0) {
        setSubscription(subs[0] as Subscription)
      } else {
        setSubscription(null)
      }
    } catch (err) {
      console.error('Error loading user profile or subscription:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsLoading(false)
      return
    }

    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadUserData(session.user.id)
      } else {
        setIsLoading(false)
      }
    })

    const { data: { subscription: authListener } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          loadUserData(session.user.id)
        } else {
          setProfile(null)
          setSubscription(null)
          setIsLoading(false)
        }
      }
    )

    return () => {
      authListener.unsubscribe()
    }
  }, [loadUserData])

  const signUp = async (email: string, password: string, displayName: string) => {
    if (!isSupabaseConfigured) {
      return { error: new Error('Supabase មិនទាន់ត្រូវបានកំណត់រចនាសម្ព័ន្ធក្នុង .env នៅឡើយទេ') }
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: displayName
        }
      }
    })
    if (error) return { error }

    if (data.user) {
      // Upsert profile
      await supabase.from('profiles').upsert({
        id: data.user.id,
        display_name: displayName,
        role: 'user'
      })
      await loadUserData(data.user.id)
    }
    return { error: null }
  }

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      return { error: new Error('Supabase មិនទាន់ត្រូវបានកំណត់រចនាសម្ព័ន្ធក្នុង .env នៅឡើយទេ') }
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    if (error) return { error }
    if (data.user) {
      await loadUserData(data.user.id)
    }
    return { error: null }
  }

  const signOut = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut()
    }
    setUser(null)
    setProfile(null)
    setSubscription(null)
  }

  const refreshProfile = async () => {
    if (user) {
      await loadUserData(user.id)
    }
  }

  const updateProfile = async (data: Partial<Profile>) => {
    if (!user) return { error: new Error('User not logged in') }
    const { error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', user.id)

    if (!error) {
      setProfile((prev: Profile | null) => (prev ? { ...prev, ...data } : null))
    }
    return { error }
  }

  const isAdmin = profile?.role === 'admin'
  const hasActiveSubscription = isAdmin || isSubscriptionActive(subscription)

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        subscription,
        hasActiveSubscription,
        isAdmin,
        isLoading,
        signUp,
        signIn,
        signOut,
        refreshProfile,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
