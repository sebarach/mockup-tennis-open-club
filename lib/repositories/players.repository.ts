import { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'
import type { Player, QueryOptions } from '@/lib/types/database'
import { BaseRepository } from './base.repository'
import { handleSupabaseError } from '@/lib/supabase/client'

export class PlayersRepository extends BaseRepository<Player> {
  constructor(client: SupabaseClient<Database>) {
    super(client, 'players')
  }

  protected getSearchFields(): string[] {
    return ['name', 'email']
  }

  protected getRelations(): Record<string, string> {
    return {
      tournaments: 'id, name, status',
      matches: 'id, tournament_id, scheduled_date, status, score',
      rankings: 'id, position, points, ranking_type'
    }
  }

  // Métodos específicos para jugadores
  async findByEmail(email: string): Promise<Player | null> {
    try {
      const { data, error } = await this.client
        .from('players')
        .select('*')
        .eq('email', email)
        .eq('is_active', true)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null
        handleSupabaseError(error)
      }

      return data as Player
    } catch (error) {
      handleSupabaseError(error)
    }
  }

  async findByRanking(options: QueryOptions = {}): Promise<Player[]> {
    try {
      const { limit = 10, include = [] } = options

      const { data, error } = await this.client
        .from('players')
        .select(this.buildSelectQuery(include))
        .eq('is_active', true)
        .not('ranking', 'is', null)
        .order('ranking', { ascending: true })
        .limit(limit)

      if (error) handleSupabaseError(error)

      return data as Player[]
    } catch (error) {
      handleSupabaseError(error)
    }
  }

  async updateStats(playerId: string, stats: {
    matches_played?: number
    wins?: number
    losses?: number
    points?: number
  }): Promise<Player> {
    try {
      const winRate = stats.matches_played && stats.matches_played > 0 
        ? ((stats.wins || 0) / stats.matches_played) * 100 
        : 0

      const updateData = {
        ...stats,
        win_rate: winRate
      }

      return await this.update(playerId, updateData)
    } catch (error) {
      handleSupabaseError(error)
    }
  }

  async getTopPlayers(limit = 10): Promise<Player[]> {
    try {
      const { data, error } = await this.client
        .from('players')
        .select('*')
        .eq('is_active', true)
        .order('points', { ascending: false })
        .limit(limit)

      if (error) handleSupabaseError(error)

      return data as Player[]
    } catch (error) {
      handleSupabaseError(error)
    }
  }

  async searchByName(searchTerm: string, limit = 10): Promise<Player[]> {
    try {
      const { data, error } = await this.client
        .from('players')
        .select('*')
        .eq('is_active', true)
        .ilike('name', `%${searchTerm}%`)
        .order('name')
        .limit(limit)

      if (error) handleSupabaseError(error)

      return data as Player[]
    } catch (error) {
      handleSupabaseError(error)
    }
  }

  async getPlayersByTournament(tournamentId: string): Promise<Player[]> {
    try {
      const { data, error } = await this.client
        .from('players')
        .select(`
          *,
          matches!inner(tournament_id)
        `)
        .eq('matches.tournament_id', tournamentId)
        .eq('is_active', true)

      if (error) handleSupabaseError(error)

      return data as Player[]
    } catch (error) {
      handleSupabaseError(error)
    }
  }

  async uploadAvatar(playerId: string, file: File): Promise<string> {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${playerId}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { error: uploadError } = await this.client.storage
        .from('player-avatars')
        .upload(filePath, file)

      if (uploadError) handleSupabaseError(uploadError)

      const { data: { publicUrl } } = this.client.storage
        .from('player-avatars')
        .getPublicUrl(filePath)

      await this.update(playerId, { avatar_url: publicUrl })

      return publicUrl
    } catch (error) {
      handleSupabaseError(error)
    }
  }

  async getPlayerStats(playerId: string): Promise<{
    totalMatches: number
    wins: number
    losses: number
    winRate: number
    currentRanking: number | null
    points: number
    recentMatches: any[]
  }> {
    try {
      const player = await this.findById(playerId)
      if (!player) throw new Error('Jugador no encontrado')

      const { data: recentMatches, error: matchesError } = await this.client
        .from('matches')
        .select(`
          *,
          tournament:tournaments(name),
          player1:players!matches_player1_id_fkey(name),
          player2:players!matches_player2_id_fkey(name)
        `)
        .or(`player1_id.eq.${playerId},player2_id.eq.${playerId}`)
        .eq('status', 'completed')
        .order('actual_end_time', { ascending: false })
        .limit(5)

      if (matchesError) handleSupabaseError(matchesError)

      return {
        totalMatches: player.matches_played,
        wins: player.wins,
        losses: player.losses,
        winRate: player.win_rate,
        currentRanking: player.ranking,
        points: player.points,
        recentMatches: recentMatches || []
      }
    } catch (error) {
      handleSupabaseError(error)
    }
  }
}