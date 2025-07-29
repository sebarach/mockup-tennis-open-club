import { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'
import type { Match, QueryOptions } from '@/lib/types/database'
import { BaseRepository } from './base.repository'
import { handleSupabaseError } from '@/lib/supabase/client'

export class MatchesRepository extends BaseRepository<Match> {
  constructor(client: SupabaseClient<Database>) {
    super(client, 'matches')
  }

  protected getSearchFields(): string[] {
    return ['notes']
  }

  protected getRelations(): Record<string, string> {
    return {
      tournament: 'id, name, tournament_type',
      player1: 'id, name, email, ranking',
      player2: 'id, name, email, ranking',
      court: 'id, name, surface_type',
      scores: 'id, set_number, player1_games, player2_games, player1_tiebreak, player2_tiebreak',
      winner: 'id, name'
    }
  }

  // Métodos específicos para matches
  async findByTournament(tournamentId: string, options: QueryOptions = {}): Promise<Match[]> {
    try {
      const { include = [] } = options

      const { data, error } = await this.client
        .from('matches')
        .select(this.buildSelectQuery(include))
        .eq('tournament_id', tournamentId)
        .eq('is_active', true)
        .order('round')
        .order('match_number')

      if (error) handleSupabaseError(error)

      return data as Match[]
    } catch (error) {
      handleSupabaseError(error)
    }
  }

  async findByPlayer(playerId: string, options: QueryOptions = {}): Promise<Match[]> {
    try {
      const { include = [], limit = 10 } = options

      const { data, error } = await this.client
        .from('matches')
        .select(this.buildSelectQuery(include))
        .or(`player1_id.eq.${playerId},player2_id.eq.${playerId}`)
        .eq('is_active', true)
        .order('scheduled_date', { ascending: false })
        .limit(limit)

      if (error) handleSupabaseError(error)

      return data as Match[]
    } catch (error) {
      handleSupabaseError(error)
    }
  }

  async findByStatus(status: Match['status'], options: QueryOptions = {}): Promise<Match[]> {
    try {
      const { include = [] } = options

      const { data, error } = await this.client
        .from('matches')
        .select(this.buildSelectQuery(include))
        .eq('status', status)
        .eq('is_active', true)
        .order('scheduled_date')

      if (error) handleSupabaseError(error)

      return data as Match[]
    } catch (error) {
      handleSupabaseError(error)
    }
  }

  async findByDateRange(startDate: string, endDate: string, options: QueryOptions = {}): Promise<Match[]> {
    try {
      const { include = [] } = options

      const { data, error } = await this.client
        .from('matches')
        .select(this.buildSelectQuery(include))
        .gte('scheduled_date', startDate)
        .lte('scheduled_date', endDate)
        .eq('is_active', true)
        .order('scheduled_date')

      if (error) handleSupabaseError(error)

      return data as Match[]
    } catch (error) {
      handleSupabaseError(error)
    }
  }

  async startMatch(matchId: string): Promise<Match> {
    try {
      const now = new Date().toISOString()
      
      return await this.update(matchId, {
        status: 'in_progress',
        actual_start_time: now
      })
    } catch (error) {
      handleSupabaseError(error)
    }
  }

  async completeMatch(matchId: string, winnerId: string, score: string): Promise<Match> {
    try {
      const now = new Date().toISOString()
      
      return await this.update(matchId, {
        status: 'completed',
        winner_id: winnerId,
        score,
        actual_end_time: now
      })
    } catch (error) {
      handleSupabaseError(error)
    }
  }

  async postponeMatch(matchId: string, newDate: string, reason?: string): Promise<Match> {
    try {
      return await this.update(matchId, {
        status: 'postponed',
        scheduled_date: newDate,
        notes: reason
      })
    } catch (error) {
      handleSupabaseError(error)
    }
  }

  async cancelMatch(matchId: string, reason?: string): Promise<Match> {
    try {
      return await this.update(matchId, {
        status: 'cancelled',
        notes: reason
      })
    } catch (error) {
      handleSupabaseError(error)
    }
  }

  async assignCourt(matchId: string, courtId: string): Promise<Match> {
    try {
      return await this.update(matchId, { court_id: courtId })
    } catch (error) {
      handleSupabaseError(error)
    }
  }

  async getUpcomingMatches(playerId?: string, limit = 10): Promise<Match[]> {
    try {
      const now = new Date().toISOString()
      
      let query = this.client
        .from('matches')
        .select(`
          *,
          tournament:tournaments(name),
          player1:players!matches_player1_id_fkey(name),
          player2:players!matches_player2_id_fkey(name),
          court:courts(name, surface_type)
        `)
        .eq('is_active', true)
        .in('status', ['scheduled', 'in_progress'])
        .gte('scheduled_date', now)
        .order('scheduled_date')
        .limit(limit)

      if (playerId) {
        query = query.or(`player1_id.eq.${playerId},player2_id.eq.${playerId}`)
      }

      const { data, error } = await query

      if (error) handleSupabaseError(error)

      return data as Match[]
    } catch (error) {
      handleSupabaseError(error)
    }
  }

  async getMatchHistory(playerId: string, limit = 20): Promise<Match[]> {
    try {
      const { data, error } = await this.client
        .from('matches')
        .select(`
          *,
          tournament:tournaments(name),
          player1:players!matches_player1_id_fkey(name),
          player2:players!matches_player2_id_fkey(name),
          court:courts(name, surface_type),
          scores(*)
        `)
        .or(`player1_id.eq.${playerId},player2_id.eq.${playerId}`)
        .eq('status', 'completed')
        .eq('is_active', true)
        .order('actual_end_time', { ascending: false })
        .limit(limit)

      if (error) handleSupabaseError(error)

      return data as Match[]
    } catch (error) {
      handleSupabaseError(error)
    }
  }

  async getHeadToHead(player1Id: string, player2Id: string): Promise<{
    matches: Match[]
    player1Wins: number
    player2Wins: number
    totalMatches: number
  }> {
    try {
      const { data, error } = await this.client
        .from('matches')
        .select(`
          *,
          tournament:tournaments(name),
          scores(*)
        `)
        .or(`and(player1_id.eq.${player1Id},player2_id.eq.${player2Id}),and(player1_id.eq.${player2Id},player2_id.eq.${player1Id})`)
        .eq('status', 'completed')
        .eq('is_active', true)
        .order('actual_end_time', { ascending: false })

      if (error) handleSupabaseError(error)

      const matches = data as Match[]
      const player1Wins = matches.filter(m => m.winner_id === player1Id).length
      const player2Wins = matches.filter(m => m.winner_id === player2Id).length

      return {
        matches,
        player1Wins,
        player2Wins,
        totalMatches: matches.length
      }
    } catch (error) {
      handleSupabaseError(error)
    }
  }

  async getTodaysMatches(): Promise<Match[]> {
    try {
      const today = new Date()
      const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString()
      const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString()

      return await this.findByDateRange(startOfDay, endOfDay, {
        include: ['tournament', 'player1', 'player2', 'court']
      })
    } catch (error) {
      handleSupabaseError(error)
    }
  }

  async getMatchStats(matchId: string): Promise<{
    duration: number | null
    sets: number
    totalGames: number
    tiebreaks: number
  }> {
    try {
      const match = await this.findById(matchId, { include: ['scores'] })
      if (!match) throw new Error('Match no encontrado')

      let duration = null
      if (match.actual_start_time && match.actual_end_time) {
        const start = new Date(match.actual_start_time)
        const end = new Date(match.actual_end_time)
        duration = Math.floor((end.getTime() - start.getTime()) / (1000 * 60)) // minutos
      }

      // Obtener scores
      const { data: scores, error } = await this.client
        .from('scores')
        .select('*')
        .eq('match_id', matchId)
        .order('set_number')

      if (error) handleSupabaseError(error)

      const sets = scores?.length || 0
      const totalGames = scores?.reduce((sum, score) => 
        sum + score.player1_games + score.player2_games, 0) || 0
      const tiebreaks = scores?.filter(score => 
        score.player1_tiebreak !== null || score.player2_tiebreak !== null).length || 0

      return {
        duration,
        sets,
        totalGames,
        tiebreaks
      }
    } catch (error) {
      handleSupabaseError(error)
    }
  }
}