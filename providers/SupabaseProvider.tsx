'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { SessionContextProvider } from '@supabase/auth-helpers-react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import type { Database } from '@/lib/supabase/database.types'

// Crear QueryClient con configuración optimizada
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      cacheTime: 10 * 60 * 1000, // 10 minutos
      refetchOnWindowFocus: false,
      retry: (failureCount, error: any) => {
        // No retry en errores de autenticación
        if (error?.status === 401) return false
        return failureCount < 2
      }
    },
    mutations: {
      retry: 1
    }
  }
})

// Context para el estado global de Supabase
interface SupabaseContextType {
  isLoading: boolean
  isOnline: boolean
}

const SupabaseContext = createContext<SupabaseContextType>({
  isLoading: true,
  isOnline: true
})

export function useSupabaseContext() {
  return useContext(SupabaseContext)
}

interface SupabaseProviderProps {
  children: React.ReactNode
  initialSession?: any
}

export function SupabaseProvider({ children, initialSession }: SupabaseProviderProps) {
  const [supabase] = useState(() => createClientComponentClient<Database>())
  const [isLoading, setIsLoading] = useState(true)
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    // Manejar estado de conexión
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  useEffect(() => {
    // Configurar listeners para auth
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'INITIAL_SESSION') {
        setIsLoading(false)
      }

      if (event === 'SIGNED_IN') {
        // Limpiar cache cuando el usuario se loguea
        queryClient.clear()
      }

      if (event === 'SIGNED_OUT') {
        // Limpiar cache cuando el usuario se desloguea
        queryClient.clear()
      }

      if (event === 'TOKEN_REFRESHED') {
        // Invalidar queries cuando se refresca el token
        queryClient.invalidateQueries()
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  // Configurar invalidación automática cuando vuelve la conexión
  useEffect(() => {
    if (isOnline) {
      queryClient.resumePausedMutations()
      queryClient.invalidateQueries()
    }
  }, [isOnline])

  const contextValue: SupabaseContextType = {
    isLoading,
    isOnline
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SessionContextProvider 
        supabaseClient={supabase} 
        initialSession={initialSession}
      >
        <SupabaseContext.Provider value={contextValue}>
          {children}
          {process.env.NODE_ENV === 'development' && (
            <ReactQueryDevtools initialIsOpen={false} />
          )}
        </SupabaseContext.Provider>
      </SessionContextProvider>
    </QueryClientProvider>
  )
}