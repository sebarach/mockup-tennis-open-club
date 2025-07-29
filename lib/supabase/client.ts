import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { createClientComponentClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from './database.types'

// Variables de entorno
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Singleton para el cliente de Supabase
class SupabaseClientSingleton {
  private static instance: SupabaseClient<Database> | null = null
  private static serverInstance: SupabaseClient<Database> | null = null

  // Cliente para componentes del lado del cliente
  public static getClient(): SupabaseClient<Database> {
    if (!SupabaseClientSingleton.instance) {
      SupabaseClientSingleton.instance = createClientComponentClient<Database>()
    }
    return SupabaseClientSingleton.instance
  }

  // Cliente para componentes del servidor
  public static getServerClient(cookieStore?: any): SupabaseClient<Database> {
    if (typeof window !== 'undefined') {
      throw new Error('Server client should not be used on the client side')
    }
    
    return createServerComponentClient<Database>({ 
      cookies: () => cookieStore || require('next/headers').cookies() 
    })
  }

  // Cliente para middleware y API routes
  public static getServiceClient(): SupabaseClient<Database> {
    return createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    })
  }

  // Limpiar instancias (útil para testing)
  public static clearInstances(): void {
    SupabaseClientSingleton.instance = null
    SupabaseClientSingleton.serverInstance = null
  }
}

// Exports principales
export const supabase = SupabaseClientSingleton.getClient()
export const getServerSupabase = SupabaseClientSingleton.getServerClient
export const getServiceSupabase = SupabaseClientSingleton.getServiceClient

// Helper para verificar si estamos en el servidor
export const isServer = typeof window === 'undefined'

// Helper para obtener el cliente correcto según el contexto
export function getSupabaseClient(context?: 'client' | 'server' | 'service') {
  if (context === 'server' || (context === undefined && isServer)) {
    return SupabaseClientSingleton.getServerClient()
  } else if (context === 'service') {
    return SupabaseClientSingleton.getServiceClient()
  }
  return SupabaseClientSingleton.getClient()
}

// Configuración por defecto para queries
export const defaultQueryConfig = {
  staleTime: 5 * 60 * 1000, // 5 minutos
  cacheTime: 10 * 60 * 1000, // 10 minutos
  refetchOnWindowFocus: false,
  retry: 1,
}

// Helper para manejo de errores de Supabase
export function handleSupabaseError(error: any): never {
  console.error('Supabase Error:', error)
  
  if (error?.code === 'PGRST301') {
    throw new Error('No tienes permisos para realizar esta operación')
  }
  
  if (error?.code === 'PGRST116') {
    throw new Error('Recurso no encontrado')
  }
  
  if (error?.message) {
    throw new Error(error.message)
  }
  
  throw new Error('Error desconocido en la base de datos')
}

export default SupabaseClientSingleton