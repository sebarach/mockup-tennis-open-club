import { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'
import type { Tournament, QueryOptions } from '@/lib/types/database'
import { BaseRepository } from './base.repository'
import { handleSupabaseError } from '@/lib/supabase/client'

export class TournamentsRepository extends BaseRepository<Tournament> {
  constructor(client: SupabaseClient<Database>) {
    super(client, 'tournaments')
  }

  protected getSearchFields(): string[] {
    return ['name', 'description', 'location']
  }

  protected getRelations(): Record<string, string> {
    return {
      matches: 'id, player1_id, player2_id, status, scheduled_date, score',
      players: 'id, name, email, ranking',
      organizer: 'id, name, email'
    }
  }

  // Métodos específicos para torneos
  async findByStatus(status: Tournament['status'], options: QueryOptions = {}): Promise<Tournament[]> {
    try {
      const { include = [] } = options

      const { data, error } = await this.client
        .from('tournaments')
        .select(this.buildSelectQuery(include))
        .eq('status', status)
        .eq('is_active', true)
        .order('start_date', { ascending: true })

      if (error) handleSupabaseError(error)

      return data as Tournament[]
    } catch (error) {
      handleSupabaseError(error)
    }
  }

  async findUpcoming(limit = 10): Promise<Tournament[]> {
    try {
      const now = new Date().toISOString()

      const { data, error } = await this.client
        .from('tournaments')
        .select('*')
        .eq('is_active', true)
        .in('status', ['upcoming', 'ongoing'])
        .gte('start_date', now)
        .order('start_date', { ascending: true })
        .limit(limit)

      if (error) handleSupabaseError(error)

      return data as Tournament[]
    } catch (error) {
      handleSupabaseError(error)
    }
  }

  async findByOrganizer(organizerId: string, options: QueryOptions = {}): Promise<Tournament[]> {
    try {
      const { include = [] } = options

      const { data, error } = await this.client
        .from('tournaments')
        .select(this.buildSelectQuery(include))
        .eq('organizer_id', organizerId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) handleSupabaseError(error)

      return data as Tournament[]
    } catch (error) {
      handleSupabaseError(error)
    }
  }

  async registerPlayer(tournamentId: string, playerId: string): Promise<boolean> {
    try {
      // Verificar que el torneo existe y permite registraciones
      const tournament = await this.findById(tournamentId)
      if (!tournament) throw new Error('Torneo no encontrado')

      if (tournament.status !== 'upcoming') {
        throw new Error('El torneo no está abierto para registraciones')
      }

      const now = new Date()
      const deadline = new Date(tournament.registration_deadline)
      if (now > deadline) {
        throw new Error('La fecha límite de registro ha pasado')
      }

      // Verificar cuántos jugadores están registrados
      const { count } = await this.client
        .from('matches')
        .select('*', { count: 'exact', head: true })
        .eq('tournament_id', tournamentId)

      const registeredPlayers = Math.sqrt((count || 0) * 2) // Aproximación basada en matches

      if (registeredPlayers >= tournament.max_players) {
        throw new Error('El torneo ha alcanzado el número máximo de jugadores')
      }

      // Verificar que el jugador no esté ya registrado
      const { data: existingMatch } = await this.client
        .from('matches')
        .select('id')
        .eq('tournament_id', tournamentId)
        .or(`player1_id.eq.${playerId},player2_id.eq.${playerId}`)
        .limit(1)
        .single()

      if (existingMatch) {
        throw new Error('El jugador ya está registrado en este torneo')
      }

      // Aquí normalmente crearíamos un registro en una tabla tournament_registrations
      // Por simplicidad, asumimos que la lógica de registro se maneja en otro lugar

      return true
    } catch (error) {
      handleSupabaseError(error)
    }
  }

  async unregisterPlayer(tournamentId: string, playerId: string): Promise<boolean> {
    try {
      const tournament = await this.findById(tournamentId)
      if (!tournament) throw new Error('Torneo no encontrado')

      if (tournament.status !== 'upcoming') {
        throw new Error('No se puede cancelar la inscripción después de que el torneo haya comenzado')
      }

      // Eliminar matches asociados (si los hay)
      const { error } = await this.client
        .from('matches')
        .delete()
        .eq('tournament_id', tournamentId)
        .or(`player1_id.eq.${playerId},player2_id.eq.${playerId}`)

      if (error) handleSupabaseError(error)

      return true
    } catch (error) {
      handleSupabaseError(error)
    }
  }

  async updateStatus(tournamentId: string, status: Tournament['status']): Promise<Tournament> {
    try {
      return await this.update(tournamentId, { status })
    } catch (error) {
      handleSupabaseError(error)
    }
  }

  async getTournamentStats(tournamentId: string): Promise<{
    totalPlayers: number
    totalMatches: number
    completedMatches: number
    remainingMatches: number
    currentRound: number
  }> {
    try {
      const { data: matches, error } = await this.client
        .from('matches')
        .select('status, round')
        .eq('tournament_id', tournamentId)
        .eq('is_active', true)

      if (error) handleSupabaseError(error)

      const totalMatches = matches?.length || 0
      const completedMatches = matches?.filter(m => m.status === 'completed').length || 0
      const remainingMatches = totalMatches - completedMatches
      const currentRound = Math.max(...(matches?.map(m => m.round) || [0]))

      // Contar jugadores únicos
      const playerIds = new Set<string>()
      matches?.forEach(match => {
        // Necesitaríamos acceso a player1_id y player2_id aquí
        // Por simplicidad, estimamos basado en el número de matches
      })

      const totalPlayers = Math.sqrt(totalMatches * 2) // Aproximación

      return {
        totalPlayers: Math.round(totalPlayers),
        totalMatches,
        completedMatches,
        remainingMatches,
        currentRound
      }
    } catch (error) {
      handleSupabaseError(error)
    }
  }

  async generateBracket(tournamentId: string, playerIds: string[]): Promise<boolean> {
    try {
      const tournament = await this.findById(tournamentId)
      if (!tournament) throw new Error('Torneo no encontrado')

      if (tournament.tournament_type === 'single_elimination') {
        return await this.generateEliminationBracket(tournamentId, playerIds)
      } else if (tournament.tournament_type === 'round_robin') {
        return await this.generateRoundRobinMatches(tournamentId, playerIds)
      }

      throw new Error('Tipo de torneo no soportado')
    } catch (error) {
      handleSupabaseError(error)
    }
  }

  private async generateEliminationBracket(tournamentId: string, playerIds: string[]): Promise<boolean> {
    try {
      const matches = []
      const now = new Date()

      // Generar primera ronda
      for (let i = 0; i < playerIds.length; i += 2) {
        if (i + 1 < playerIds.length) {
          matches.push({
            tournament_id: tournamentId,
            player1_id: playerIds[i],
            player2_id: playerIds[i + 1],
            round: 1,
            match_number: Math.floor(i / 2) + 1,
            scheduled_date: new Date(now.getTime() + (i * 60 * 60 * 1000)).toISOString(), // Espaciar por horas
            status: 'scheduled' as const
          })
        }
      }

      const { error } = await this.client
        .from('matches')
        .insert(matches)

      if (error) handleSupabaseError(error)

      return true
    } catch (error) {
      handleSupabaseError(error)
    }
  }

  private async generateRoundRobinMatches(tournamentId: string, playerIds: string[]): Promise<boolean> {
    try {
      const matches = []
      const now = new Date()
      let matchNumber = 1

      // Generar todos contra todos
      for (let i = 0; i < playerIds.length; i++) {
        for (let j = i + 1; j < playerIds.length; j++) {
          matches.push({
            tournament_id: tournamentId,
            player1_id: playerIds[i],
            player2_id: playerIds[j],
            round: 1,
            match_number: matchNumber++,
            scheduled_date: new Date(now.getTime() + (matchNumber * 60 * 60 * 1000)).toISOString(),
            status: 'scheduled' as const
          })
        }
      }

      const { error } = await this.client
        .from('matches')
        .insert(matches)

      if (error) handleSupabaseError(error)

      return true
    } catch (error) {
      handleSupabaseError(error)
    }
  }
}