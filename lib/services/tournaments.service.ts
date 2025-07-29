import { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'
import type { Tournament, CreateEntity, UpdateEntity, QueryOptions } from '@/lib/types/database'
import { TournamentsRepository } from '@/lib/repositories/tournaments.repository'
import { PlayersRepository } from '@/lib/repositories/players.repository'
import { MatchesRepository } from '@/lib/repositories/matches.repository'
import { handleSupabaseError } from '@/lib/supabase/client'

export class TournamentsService {
  private tournamentsRepo: TournamentsRepository
  private playersRepo: PlayersRepository
  private matchesRepo: MatchesRepository

  constructor(client: SupabaseClient<Database>) {
    this.tournamentsRepo = new TournamentsRepository(client)
    this.playersRepo = new PlayersRepository(client)
    this.matchesRepo = new MatchesRepository(client)
  }

  // CRUD Operations
  async createTournament(data: CreateEntity<Tournament>): Promise<Tournament> {
    try {
      // Validaciones de negocio
      this.validateTournamentDates(data.start_date, data.end_date, data.registration_deadline)
      
      if (data.max_players < 2) {
        throw new Error('El torneo debe tener al menos 2 jugadores')
      }

      if (data.max_players > 128) {
        throw new Error('El torneo no puede tener más de 128 jugadores')
      }

      // Verificar que el número de jugadores sea compatible con el tipo de torneo
      if (data.tournament_type === 'single_elimination') {
        if (!this.isPowerOfTwo(data.max_players)) {
          throw new Error('Para eliminación simple, el número de jugadores debe ser una potencia de 2')
        }
      }

      const tournamentData = {
        ...data,
        status: 'upcoming' as const,
        is_active: true
      }

      return await this.tournamentsRepo.create(tournamentData)
    } catch (error) {
      handleSupabaseError(error)
    }
  }

  async updateTournament(id: string, data: UpdateEntity<Tournament>): Promise<Tournament> {
    try {
      const tournament = await this.tournamentsRepo.findById(id)
      if (!tournament) throw new Error('Torneo no encontrado')

      // Validar que ciertos campos no se pueden cambiar si el torneo ya comenzó
      if (tournament.status !== 'upcoming') {
        const restrictedFields = ['max_players', 'tournament_type', 'start_date']
        const hasRestrictedChanges = restrictedFields.some(field => data[field as keyof UpdateEntity<Tournament>] !== undefined)
        
        if (hasRestrictedChanges) {
          throw new Error('No se pueden modificar estos campos después de que el torneo haya comenzado')
        }
      }

      if (data.start_date && data.end_date) {
        this.validateTournamentDates(data.start_date, data.end_date, data.registration_deadline || tournament.registration_deadline)
      }

      return await this.tournamentsRepo.update(id, data)
    } catch (error) {
      handleSupabaseError(error)
    }
  }

  async getTournaments(options: QueryOptions = {}) {
    try {
      return await this.tournamentsRepo.findMany(options)
    } catch (error) {
      handleSupabaseError(error)
    }
  }

  async getTournamentById(id: string, includeDetails = false) {
    try {
      const include = includeDetails ? ['matches', 'players', 'organizer'] : []
      return await this.tournamentsRepo.findById(id, { include })
    } catch (error) {
      handleSupabaseError(error)
    }
  }

  async deleteTournament(id: string, hard = false): Promise<boolean> {
    try {
      const tournament = await this.tournamentsRepo.findById(id)
      if (!tournament) throw new Error('Torneo no encontrado')

      if (tournament.status === 'ongoing') {
        throw new Error('No se puede eliminar un torneo en curso')
      }

      // Si hay matches, no permitir eliminación dura
      const matches = await this.matchesRepo.findByTournament(id)
      if (matches.length > 0 && hard) {
        throw new Error('No se puede eliminar permanentemente un torneo con matches')
      }

      return await this.tournamentsRepo.delete(id, hard)
    } catch (error) {
      handleSupabaseError(error)
    }
  }

  // Operaciones específicas del dominio
  async registerPlayer(tournamentId: string, playerId: string): Promise<boolean> {
    try {
      const tournament = await this.tournamentsRepo.findById(tournamentId)
      if (!tournament) throw new Error('Torneo no encontrado')

      const player = await this.playersRepo.findById(playerId)
      if (!player) throw new Error('Jugador no encontrado')

      return await this.tournamentsRepo.registerPlayer(tournamentId, playerId)
    } catch (error) {
      handleSupabaseError(error)
    }
  }

  async unregisterPlayer(tournamentId: string, playerId: string): Promise<boolean> {
    try {
      return await this.tournamentsRepo.unregisterPlayer(tournamentId, playerId)
    } catch (error) {
      handleSupabaseError(error)
    }
  }

  async startTournament(tournamentId: string): Promise<Tournament> {
    try {
      const tournament = await this.tournamentsRepo.findById(tournamentId)
      if (!tournament) throw new Error('Torneo no encontrado')

      if (tournament.status !== 'upcoming') {
        throw new Error('Solo se pueden iniciar torneos que estén programados')
      }

      // Verificar que hay suficientes jugadores
      const registeredPlayers = await this.tournamentsRepo.getPlayersByTournament(tournamentId)
      
      if (registeredPlayers.length < 2) {
        throw new Error('Se necesitan al menos 2 jugadores para iniciar el torneo')
      }

      // Generar bracket
      const playerIds = registeredPlayers.map(p => p.id)
      await this.tournamentsRepo.generateBracket(tournamentId, playerIds)

      return await this.tournamentsRepo.updateStatus(tournamentId, 'ongoing')
    } catch (error) {
      handleSupabaseError(error)
    }
  }

  async completeTournament(tournamentId: string): Promise<Tournament> {
    try {
      const tournament = await this.tournamentsRepo.findById(tournamentId)
      if (!tournament) throw new Error('Torneo no encontrado')

      if (tournament.status !== 'ongoing') {
        throw new Error('Solo se pueden completar torneos en curso')
      }

      // Verificar que todos los matches estén completados
      const matches = await this.matchesRepo.findByTournament(tournamentId)
      const pendingMatches = matches.filter(m => m.status !== 'completed' && m.status !== 'cancelled')

      if (pendingMatches.length > 0) {
        throw new Error('No se puede completar el torneo con matches pendientes')
      }

      return await this.tournamentsRepo.updateStatus(tournamentId, 'completed')
    } catch (error) {
      handleSupabaseError(error)
    }
  }

  async cancelTournament(tournamentId: string, reason?: string): Promise<Tournament> {
    try {
      const tournament = await this.tournamentsRepo.findById(tournamentId)
      if (!tournament) throw new Error('Torneo no encontrado')

      if (tournament.status === 'completed') {
        throw new Error('No se puede cancelar un torneo completado')
      }

      // Cancelar todos los matches pendientes
      const matches = await this.matchesRepo.findByTournament(tournamentId)
      const pendingMatches = matches.filter(m => m.status === 'scheduled' || m.status === 'in_progress')

      for (const match of pendingMatches) {
        await this.matchesRepo.cancelMatch(match.id, reason)
      }

      return await this.tournamentsRepo.updateStatus(tournamentId, 'cancelled')
    } catch (error) {
      handleSupabaseError(error)
    }
  }

  async getTournamentBracket(tournamentId: string) {
    try {
      const tournament = await this.tournamentsRepo.findById(tournamentId)
      if (!tournament) throw new Error('Torneo no encontrado')

      const matches = await this.matchesRepo.findByTournament(tournamentId, {
        include: ['player1', 'player2', 'winner']
      })

      return this.formatBracket(tournament, matches)
    } catch (error) {
      handleSupabaseError(error)
    }
  }

  async getTournamentStandings(tournamentId: string) {
    try {
      const tournament = await this.tournamentsRepository.findById(tournamentId)
      if (!tournament) throw new Error('Torneo no encontrado')

      if (tournament.tournament_type === 'round_robin') {
        return await this.getRoundRobinStandings(tournamentId)
      } else {
        return await this.getEliminationStandings(tournamentId)
      }
    } catch (error) {
      handleSupabaseError(error)
    }
  }

  async getUpcomingTournaments(limit = 10) {
    try {
      return await this.tournamentsRepo.findUpcoming(limit)
    } catch (error) {
      handleSupabaseError(error)
    }
  }

  async getTournamentsByOrganizer(organizerId: string) {
    try {
      return await this.tournamentsRepo.findByOrganizer(organizerId)
    } catch (error) {
      handleSupabaseError(error)
    }
  }

  // Métodos privados
  private validateTournamentDates(startDate: string, endDate: string, registrationDeadline: string) {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const deadline = new Date(registrationDeadline)
    const now = new Date()

    if (start <= now) {
      throw new Error('La fecha de inicio debe ser futura')
    }

    if (end <= start) {
      throw new Error('La fecha de fin debe ser posterior a la fecha de inicio')
    }

    if (deadline >= start) {
      throw new Error('La fecha límite de registro debe ser anterior al inicio del torneo')
    }
  }

  private isPowerOfTwo(n: number): boolean {
    return n > 0 && (n & (n - 1)) === 0
  }

  private formatBracket(tournament: Tournament, matches: any[]) {
    if (tournament.tournament_type === 'single_elimination') {
      return this.formatEliminationBracket(matches)
    } else {
      return this.formatRoundRobinBracket(matches)
    }
  }

  private formatEliminationBracket(matches: any[]) {
    const rounds = new Map<number, any[]>()
    
    matches.forEach(match => {
      if (!rounds.has(match.round)) {
        rounds.set(match.round, [])
      }
      rounds.get(match.round)!.push(match)
    })

    return Array.from(rounds.entries()).map(([round, roundMatches]) => ({
      round,
      matches: roundMatches.sort((a, b) => a.match_number - b.match_number)
    }))
  }

  private formatRoundRobinBracket(matches: any[]) {
    return {
      matches: matches.sort((a, b) => a.match_number - b.match_number)
    }
  }

  private async getRoundRobinStandings(tournamentId: string) {
    // Implementar lógica para standings de round robin
    return []
  }

  private async getEliminationStandings(tournamentId: string) {
    // Implementar lógica para standings de eliminación
    return []
  }
}