import { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'
import type { Player, CreateEntity, UpdateEntity, QueryOptions } from '@/lib/types/database'
import { PlayersRepository } from '@/lib/repositories/players.repository'
import { MatchesRepository } from '@/lib/repositories/matches.repository'
import { handleSupabaseError } from '@/lib/supabase/client'

export class PlayersService {
  private playersRepo: PlayersRepository
  private matchesRepo: MatchesRepository

  constructor(client: SupabaseClient<Database>) {
    this.playersRepo = new PlayersRepository(client)
    this.matchesRepo = new MatchesRepository(client)
  }

  // CRUD Operations
  async createPlayer(data: CreateEntity<Player>): Promise<Player> {
    try {
      // Validaciones de negocio
      if (!data.email || !this.isValidEmail(data.email)) {
        throw new Error('Email inválido')
      }

      // Verificar que el email no exista
      const existingPlayer = await this.playersRepo.findByEmail(data.email)
      if (existingPlayer) {
        throw new Error('Ya existe un jugador con este email')
      }

      // Crear jugador con valores por defecto
      const playerData = {
        ...data,
        points: data.points || 0,
        matches_played: 0,
        wins: 0,
        losses: 0,
        win_rate: 0,
        join_date: data.join_date || new Date().toISOString().split('T')[0],
        achievements: data.achievements || [],
        is_active: true
      }

      return await this.playersRepo.create(playerData)
    } catch (error) {
      handleSupabaseError(error)
    }
  }

  async updatePlayer(id: string, data: UpdateEntity<Player>): Promise<Player> {
    try {
      // Validar email si se está actualizando
      if (data.email && !this.isValidEmail(data.email)) {
        throw new Error('Email inválido')
      }

      if (data.email) {
        const existingPlayer = await this.playersRepo.findByEmail(data.email)
        if (existingPlayer && existingPlayer.id !== id) {
          throw new Error('Ya existe un jugador con este email')
        }
      }

      return await this.playersRepo.update(id, data)
    } catch (error) {
      handleSupabaseError(error)
    }
  }

  async getPlayers(options: QueryOptions = {}) {
    try {
      return await this.playersRepo.findMany(options)
    } catch (error) {
      handleSupabaseError(error)
    }
  }

  async getPlayerById(id: string, includeRelations = false) {
    try {
      const include = includeRelations ? ['matches', 'rankings'] : []
      return await this.playersRepo.findById(id, { include })
    } catch (error) {
      handleSupabaseError(error)
    }
  }

  async deletePlayer(id: string, hard = false): Promise<boolean> {
    try {
      // Verificar que el jugador no tenga matches pendientes
      const upcomingMatches = await this.matchesRepo.findByPlayer(id, {
        filters: { status: 'scheduled' }
      })

      if (upcomingMatches.length > 0 && hard) {
        throw new Error('No se puede eliminar un jugador con matches programados')
      }

      return await this.playersRepo.delete(id, hard)
    } catch (error) {
      handleSupabaseError(error)
    }
  }

  // Operaciones específicas del dominio
  async updatePlayerStats(playerId: string): Promise<Player> {
    try {
      // Obtener todas las estadísticas del jugador
      const matches = await this.matchesRepo.findByPlayer(playerId, {
        filters: { status: 'completed' }
      })

      const stats = this.calculatePlayerStats(playerId, matches)
      
      return await this.playersRepo.updateStats(playerId, stats)
    } catch (error) {
      handleSupabaseError(error)
    }
  }

  async getRankings(limit = 10) {
    try {
      return await this.playersRepo.findByRanking({ limit })
    } catch (error) {
      handleSupabaseError(error)
    }
  }

  async searchPlayers(searchTerm: string, limit = 10) {
    try {
      return await this.playersRepo.searchByName(searchTerm, limit)
    } catch (error) {
      handleSupabaseError(error)
    }
  }

  async getPlayerProfile(playerId: string) {
    try {
      const player = await this.playersRepo.findById(playerId)
      if (!player) throw new Error('Jugador no encontrado')

      const stats = await this.playersRepo.getPlayerStats(playerId)
      const recentMatches = await this.matchesRepo.findByPlayer(playerId, { limit: 5 })

      return {
        player,
        stats,
        recentMatches
      }
    } catch (error) {
      handleSupabaseError(error)
    }
  }

  async updatePlayerRanking(): Promise<void> {
    try {
      // Obtener todos los jugadores activos ordenados por puntos
      const players = await this.playersRepo.findMany({
        sortBy: 'points',
        sortOrder: 'desc',
        limit: 1000 // Asumir que no hay más de 1000 jugadores
      })

      // Actualizar rankings
      const updates = players.data.map((player, index) => ({
        id: player.id,
        ranking: index + 1
      }))

      // Actualizar en lotes
      for (const update of updates) {
        await this.playersRepo.update(update.id, { ranking: update.ranking })
      }
    } catch (error) {
      handleSupabaseError(error)
    }
  }

  async uploadPlayerAvatar(playerId: string, file: File): Promise<string> {
    try {
      // Validar archivo
      if (!file.type.startsWith('image/')) {
        throw new Error('El archivo debe ser una imagen')
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB
        throw new Error('El archivo no puede ser mayor a 5MB')
      }

      return await this.playersRepo.uploadAvatar(playerId, file)
    } catch (error) {
      handleSupabaseError(error)
    }
  }

  async getHeadToHead(player1Id: string, player2Id: string) {
    try {
      return await this.matchesRepo.getHeadToHead(player1Id, player2Id)
    } catch (error) {
      handleSupabaseError(error)
    }
  }

  // Métodos privados de utilidad
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  private calculatePlayerStats(playerId: string, matches: any[]) {
    const stats = {
      matches_played: matches.length,
      wins: 0,
      losses: 0,
      points: 0
    }

    matches.forEach(match => {
      if (match.winner_id === playerId) {
        stats.wins++
        stats.points += this.getPointsForWin(match)
      } else {
        stats.losses++
      }
    })

    return stats
  }

  private getPointsForWin(match: any): number {
    // Lógica para calcular puntos basado en el tipo de match, oponente, etc.
    // Por simplicidad, asignamos puntos fijos
    return 10
  }
}