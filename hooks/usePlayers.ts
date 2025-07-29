import { useSupabaseClient } from '@supabase/auth-helpers-react'
import type { Database } from '@/lib/supabase/database.types'
import type { Player, CreateEntity, UpdateEntity, QueryOptions } from '@/lib/types/database'
import { PlayersService } from '@/lib/services/players.service'
import { useSupabaseQuery, useSupabaseMutation, useInvalidateQueries } from './useSupabase'

// Hook para obtener el servicio de jugadores
function usePlayersService() {
  const supabase = useSupabaseClient<Database>()
  return new PlayersService(supabase)
}

// Query hooks
export function usePlayers(options: QueryOptions = {}) {
  const service = usePlayersService()
  
  return useSupabaseQuery(
    ['players', options],
    () => service.getPlayers(options),
    {
      enabled: true
    }
  )
}

export function usePlayer(id: string, includeRelations = false) {
  const service = usePlayersService()
  
  return useSupabaseQuery(
    ['players', id, includeRelations],
    () => service.getPlayerById(id, includeRelations),
    {
      enabled: !!id
    }
  )
}

export function usePlayerProfile(id: string) {
  const service = usePlayersService()
  
  return useSupabaseQuery(
    ['players', id, 'profile'],
    () => service.getPlayerProfile(id),
    {
      enabled: !!id
    }
  )
}

export function usePlayerRankings(limit = 10) {
  const service = usePlayersService()
  
  return useSupabaseQuery(
    ['players', 'rankings', limit],
    () => service.getRankings(limit)
  )
}

export function usePlayerSearch(searchTerm: string, limit = 10) {
  const service = usePlayersService()
  
  return useSupabaseQuery(
    ['players', 'search', searchTerm, limit],
    () => service.searchPlayers(searchTerm, limit),
    {
      enabled: searchTerm.length > 0
    }
  )
}

export function useHeadToHead(player1Id: string, player2Id: string) {
  const service = usePlayersService()
  
  return useSupabaseQuery(
    ['players', 'head-to-head', player1Id, player2Id],
    () => service.getHeadToHead(player1Id, player2Id),
    {
      enabled: !!player1Id && !!player2Id
    }
  )
}

// Mutation hooks
export function useCreatePlayer(options?: {
  onSuccess?: (data: Player) => void
  onError?: (error: Error) => void
}) {
  const service = usePlayersService()
  const { invalidateByPattern } = useInvalidateQueries()
  
  return useSupabaseMutation(
    (data: CreateEntity<Player>) => service.createPlayer(data),
    {
      onSuccess: (data) => {
        invalidateByPattern('players')
        options?.onSuccess?.(data)
      },
      onError: options?.onError
    }
  )
}

export function useUpdatePlayer(options?: {
  onSuccess?: (data: Player) => void
  onError?: (error: Error) => void
}) {
  const service = usePlayersService()
  const { invalidateByPattern } = useInvalidateQueries()
  
  return useSupabaseMutation(
    ({ id, data }: { id: string; data: UpdateEntity<Player> }) => 
      service.updatePlayer(id, data),
    {
      onSuccess: (data) => {
        invalidateByPattern('players')
        options?.onSuccess?.(data)
      },
      onError: options?.onError
    }
  )
}

export function useDeletePlayer(options?: {
  onSuccess?: () => void
  onError?: (error: Error) => void
}) {
  const service = usePlayersService()
  const { invalidateByPattern } = useInvalidateQueries()
  
  return useSupabaseMutation(
    ({ id, hard = false }: { id: string; hard?: boolean }) => 
      service.deletePlayer(id, hard),
    {
      onSuccess: () => {
        invalidateByPattern('players')
        options?.onSuccess?.()
      },
      onError: options?.onError
    }
  )
}

export function useUpdatePlayerStats(options?: {
  onSuccess?: (data: Player) => void
  onError?: (error: Error) => void
}) {
  const service = usePlayersService()
  const { invalidateByPattern } = useInvalidateQueries()
  
  return useSupabaseMutation(
    (playerId: string) => service.updatePlayerStats(playerId),
    {
      onSuccess: (data) => {
        invalidateByPattern('players')
        options?.onSuccess?.(data)
      },
      onError: options?.onError
    }
  )
}

export function useUploadPlayerAvatar(options?: {
  onSuccess?: (url: string) => void
  onError?: (error: Error) => void
}) {
  const service = usePlayersService()
  const { invalidateByPattern } = useInvalidateQueries()
  
  return useSupabaseMutation(
    ({ playerId, file }: { playerId: string; file: File }) => 
      service.uploadPlayerAvatar(playerId, file),
    {
      onSuccess: (url) => {
        invalidateByPattern('players')
        options?.onSuccess?.(url)
      },
      onError: options?.onError
    }
  )
}

export function useUpdatePlayerRanking(options?: {
  onSuccess?: () => void
  onError?: (error: Error) => void
}) {
  const service = usePlayersService()
  const { invalidateByPattern } = useInvalidateQueries()
  
  return useSupabaseMutation(
    () => service.updatePlayerRanking(),
    {
      onSuccess: () => {
        invalidateByPattern('players')
        options?.onSuccess?.()
      },
      onError: options?.onError
    }
  )
}