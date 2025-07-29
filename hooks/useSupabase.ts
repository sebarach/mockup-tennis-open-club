import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import type { Database } from '@/lib/supabase/database.types'
import type { QueryOptions, PaginatedResponse } from '@/lib/types/database'

// Hook base para queries
export function useSupabaseQuery<TData = unknown, TError = Error>(
  key: (string | number | boolean | object)[],
  queryFn: () => Promise<TData>,
  options?: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: key,
    queryFn,
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false,
    retry: 1,
    ...options
  })
}

// Hook base para mutaciones
export function useSupabaseMutation<TData = unknown, TError = Error, TVariables = void>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: UseMutationOptions<TData, TError, TVariables>
) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn,
    onSuccess: (data, variables, context) => {
      // Invalidar queries relevantes por defecto
      queryClient.invalidateQueries()
      options?.onSuccess?.(data, variables, context)
    },
    ...options
  })
}

// Hook para subscripciones en tiempo real
export function useRealtimeSubscription<T>(
  table: string, 
  callback: (payload: any) => void,
  options?: {
    filter?: string
    enabled?: boolean
  }
) {
  const supabase = useSupabaseClient<Database>()
  
  React.useEffect(() => {
    if (!options?.enabled) return

    const subscription = supabase
      .channel(`${table}_changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
          filter: options?.filter
        },
        callback
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [table, callback, options?.filter, options?.enabled])
}

// Hook para invalidar queries específicas
export function useInvalidateQueries() {
  const queryClient = useQueryClient()
  
  return {
    invalidateAll: () => queryClient.invalidateQueries(),
    invalidateByKey: (key: string[]) => queryClient.invalidateQueries({ queryKey: key }),
    invalidateByPattern: (pattern: string) => {
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey.some(k => String(k).includes(pattern))
      })
    }
  }
}

// Hook para optimistic updates
export function useOptimisticUpdate() {
  const queryClient = useQueryClient()
  
  return {
    setOptimisticData: <T>(key: string[], updater: (old: T | undefined) => T) => {
      queryClient.setQueryData(key, updater)
    },
    rollbackOptimisticData: (key: string[]) => {
      queryClient.invalidateQueries({ queryKey: key })
    }
  }
}