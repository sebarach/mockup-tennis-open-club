// Tipos para las entidades del dominio del torneo de tenis
export interface Player {
  id: string
  name: string
  email: string
  phone?: string
  ranking?: number
  points: number
  matches_played: number
  wins: number
  losses: number
  win_rate: number
  join_date: string
  last_match?: string
  favorite_shot?: string
  playing_style?: string
  achievements: string[]
  avatar_url?: string
  is_active: boolean
  created_at: string
  updated_at: string
  created_by?: string
}

export interface Tournament {
  id: string
  name: string
  description?: string
  start_date: string
  end_date: string
  max_players: number
  entry_fee?: number
  prize_pool?: number
  tournament_type: 'single_elimination' | 'round_robin' | 'swiss'
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
  registration_deadline: string
  rules?: string
  location?: string
  organizer_id: string
  is_active: boolean
  created_at: string
  updated_at: string
  created_by?: string
}

export interface Match {
  id: string
  tournament_id: string
  player1_id: string
  player2_id: string
  court_id?: string
  scheduled_date: string
  actual_start_time?: string
  actual_end_time?: string
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'postponed'
  round: number
  match_number: number
  winner_id?: string
  score?: string
  notes?: string
  is_active: boolean
  created_at: string
  updated_at: string
  created_by?: string
}

export interface Court {
  id: string
  name: string
  surface_type: 'clay' | 'hard' | 'grass' | 'synthetic'
  is_indoor: boolean
  is_available: boolean
  hourly_rate?: number
  description?: string
  image_url?: string
  location?: string
  is_active: boolean
  created_at: string
  updated_at: string
  created_by?: string
}

export interface Score {
  id: string
  match_id: string
  set_number: number
  player1_games: number
  player2_games: number
  player1_tiebreak?: number
  player2_tiebreak?: number
  is_completed: boolean
  created_at: string
  updated_at: string
}

export interface Ranking {
  id: string
  player_id: string
  tournament_id?: string
  position: number
  points: number
  matches_played: number
  wins: number
  losses: number
  win_percentage: number
  ranking_type: 'overall' | 'tournament' | 'seasonal'
  period_start: string
  period_end?: string
  is_current: boolean
  created_at: string
  updated_at: string
}

// Tipos para relaciones
export interface PlayerWithStats extends Player {
  tournaments?: Tournament[]
  matches?: Match[]
  rankings?: Ranking[]
}

export interface TournamentWithDetails extends Tournament {
  players?: Player[]
  matches?: Match[]
  organizer?: Player
}

export interface MatchWithDetails extends Match {
  tournament?: Tournament
  player1?: Player
  player2?: Player
  court?: Court
  scores?: Score[]
  winner?: Player
}

// Tipos para operaciones de la base
export type BaseEntity = {
  id: string
  is_active: boolean
  created_at: string
  updated_at: string
  created_by?: string
}

export type CreateEntity<T> = Omit<T, 'id' | 'created_at' | 'updated_at'>
export type UpdateEntity<T> = Partial<Omit<T, 'id' | 'created_at' | 'updated_at'>>

// Tipos para queries
export interface QueryOptions {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  search?: string
  filters?: Record<string, any>
  include?: string[]
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// Tipos para errores
export interface DatabaseError {
  code: string
  message: string
  details?: any
  hint?: string
}

// Tipos para autenticación
export interface UserProfile {
  id: string
  email: string
  role: 'admin' | 'player' | 'viewer'
  full_name?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

// Tipos para real-time
export interface RealtimePayload<T> {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  new?: T
  old?: T
  table: string
  schema: string
}