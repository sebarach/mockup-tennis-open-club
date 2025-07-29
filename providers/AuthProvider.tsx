'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useSupabaseClient, useUser, useSession } from '@supabase/auth-helpers-react'
import type { Database } from '@/lib/supabase/database.types'
import type { UserProfile } from '@/lib/types/database'

interface AuthContextType {
  user: any | null
  profile: UserProfile | null
  isLoading: boolean
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<{ error?: any }>
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error?: any }>
  signOut: () => Promise<void>
  updateProfile: (data: Partial<UserProfile>) => Promise<{ error?: any }>
  isAdmin: boolean
  isPlayer: boolean
  isViewer: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const supabase = useSupabaseClient<Database>()
  const user = useUser()
  const session = useSession()
  
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Cargar perfil del usuario
  useEffect(() => {
    if (user) {
      loadUserProfile(user.id)
    } else {
      setProfile(null)
      setIsLoading(false)
    }
  }, [user])

  async function loadUserProfile(userId: string) {
    try {
      setIsLoading(true)
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        // Si no existe el perfil, crearlo
        if (error.code === 'PGRST116') {
          await createUserProfile(userId)
          return
        }
        throw error
      }

      setProfile(data as UserProfile)
    } catch (error) {
      console.error('Error loading user profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function createUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .insert({
          id: userId,
          email: user?.email || '',
          role: 'viewer',
          full_name: user?.user_metadata?.full_name || null,
          avatar_url: user?.user_metadata?.avatar_url || null
        })
        .select()
        .single()

      if (error) throw error

      setProfile(data as UserProfile)
    } catch (error) {
      console.error('Error creating user profile:', error)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      return { error }
    } catch (error) {
      return { error }
    }
  }

  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      })
      return { error }
    } catch (error) {
      return { error }
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setProfile(null)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return { error: new Error('No user found') }

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (!error && profile) {
        setProfile({ ...profile, ...data })
      }

      return { error }
    } catch (error) {
      return { error }
    }
  }

  // Helpers para roles
  const isAdmin = profile?.role === 'admin'
  const isPlayer = profile?.role === 'player'
  const isViewer = profile?.role === 'viewer'
  const isAuthenticated = !!user && !!session

  const value: AuthContextType = {
    user,
    profile,
    isLoading,
    isAuthenticated,
    signIn,
    signUp,
    signOut,
    updateProfile,
    isAdmin,
    isPlayer,
    isViewer
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook para proteger rutas
export function useRequireAuth(requiredRole?: 'admin' | 'player' | 'viewer') {
  const { isAuthenticated, profile, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Redirigir a login
      window.location.href = '/login'
      return
    }

    if (!isLoading && requiredRole && profile?.role !== requiredRole) {
      // Redirigir a página de acceso denegado
      window.location.href = '/unauthorized'
      return
    }
  }, [isAuthenticated, profile, isLoading, requiredRole])

  return { isAuthenticated, profile, isLoading }
}

// Hook para verificar permisos
export function usePermissions() {
  const { profile, isAdmin, isPlayer, isViewer } = useAuth()

  return {
    canManageTournaments: isAdmin,
    canManagePlayers: isAdmin,
    canManageMatches: isAdmin || isPlayer,
    canViewReports: isAdmin,
    canEditProfile: isAdmin || isPlayer,
    canPlayMatches: isPlayer,
    role: profile?.role
  }
}