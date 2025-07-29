// Tipos autogenerados de Supabase (deberían ser generados con supabase gen types)
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      players: {
        Row: {
          id: string
          name: string
          email: string
          phone: string | null
          ranking: number | null
          points: number
          matches_played: number
          wins: number
          losses: number
          win_rate: number
          join_date: string
          last_match: string | null
          favorite_shot: string | null
          playing_style: string | null
          achievements: string[]
          avatar_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone?: string | null
          ranking?: number | null
          points?: number
          matches_played?: number
          wins?: number
          losses?: number
          win_rate?: number
          join_date?: string
          last_match?: string | null
          favorite_shot?: string | null
          playing_style?: string | null
          achievements?: string[]
          avatar_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string | null
          ranking?: number | null
          points?: number
          matches_played?: number
          wins?: number
          losses?: number
          win_rate?: number
          join_date?: string
          last_match?: string | null
          favorite_shot?: string | null
          playing_style?: string | null
          achievements?: string[]
          avatar_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
      }
      tournaments: {
        Row: {
          id: string
          name: string
          description: string | null
          start_date: string
          end_date: string
          max_players: number
          entry_fee: number | null
          prize_pool: number | null
          tournament_type: 'single_elimination' | 'round_robin' | 'swiss'
          status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
          registration_deadline: string
          rules: string | null
          location: string | null
          organizer_id: string
          is_active: boolean
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          start_date: string
          end_date: string
          max_players: number
          entry_fee?: number | null
          prize_pool?: number | null
          tournament_type: 'single_elimination' | 'round_robin' | 'swiss'
          status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
          registration_deadline: string
          rules?: string | null
          location?: string | null
          organizer_id: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          start_date?: string
          end_date?: string
          max_players?: number
          entry_fee?: number | null
          prize_pool?: number | null
          tournament_type?: 'single_elimination' | 'round_robin' | 'swiss'
          status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
          registration_deadline?: string
          rules?: string | null
          location?: string | null
          organizer_id?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
      }
      matches: {
        Row: {
          id: string
          tournament_id: string
          player1_id: string
          player2_id: string
          court_id: string | null
          scheduled_date: string
          actual_start_time: string | null
          actual_end_time: string | null
          status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'postponed'
          round: number
          match_number: number
          winner_id: string | null
          score: string | null
          notes: string | null
          is_active: boolean
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          tournament_id: string
          player1_id: string
          player2_id: string
          court_id?: string | null
          scheduled_date: string
          actual_start_time?: string | null
          actual_end_time?: string | null
          status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'postponed'
          round: number
          match_number: number
          winner_id?: string | null
          score?: string | null
          notes?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          tournament_id?: string
          player1_id?: string
          player2_id?: string
          court_id?: string | null
          scheduled_date?: string
          actual_start_time?: string | null
          actual_end_time?: string | null
          status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'postponed'
          round?: number
          match_number?: number
          winner_id?: string | null
          score?: string | null
          notes?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
      }
      courts: {
        Row: {
          id: string
          name: string
          surface_type: 'clay' | 'hard' | 'grass' | 'synthetic'
          is_indoor: boolean
          is_available: boolean
          hourly_rate: number | null
          description: string | null
          image_url: string | null
          location: string | null
          is_active: boolean
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          name: string
          surface_type: 'clay' | 'hard' | 'grass' | 'synthetic'
          is_indoor?: boolean
          is_available?: boolean
          hourly_rate?: number | null
          description?: string | null
          image_url?: string | null
          location?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          name?: string
          surface_type?: 'clay' | 'hard' | 'grass' | 'synthetic'
          is_indoor?: boolean
          is_available?: boolean
          hourly_rate?: number | null
          description?: string | null
          image_url?: string | null
          location?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
      }
      scores: {
        Row: {
          id: string
          match_id: string
          set_number: number
          player1_games: number
          player2_games: number
          player1_tiebreak: number | null
          player2_tiebreak: number | null
          is_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          match_id: string
          set_number: number
          player1_games: number
          player2_games: number
          player1_tiebreak?: number | null
          player2_tiebreak?: number | null
          is_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          match_id?: string
          set_number?: number
          player1_games?: number
          player2_games?: number
          player1_tiebreak?: number | null
          player2_tiebreak?: number | null
          is_completed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      rankings: {
        Row: {
          id: string
          player_id: string
          tournament_id: string | null
          position: number
          points: number
          matches_played: number
          wins: number
          losses: number
          win_percentage: number
          ranking_type: 'overall' | 'tournament' | 'seasonal'
          period_start: string
          period_end: string | null
          is_current: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          player_id: string
          tournament_id?: string | null
          position: number
          points: number
          matches_played: number
          wins: number
          losses: number
          win_percentage: number
          ranking_type: 'overall' | 'tournament' | 'seasonal'
          period_start: string
          period_end?: string | null
          is_current?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          player_id?: string
          tournament_id?: string | null
          position?: number
          points?: number
          matches_played?: number
          wins?: number
          losses?: number
          win_percentage?: number
          ranking_type?: 'overall' | 'tournament' | 'seasonal'
          period_start?: string
          period_end?: string | null
          is_current?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          email: string
          role: 'admin' | 'player' | 'viewer'
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          role?: 'admin' | 'player' | 'viewer'
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: 'admin' | 'player' | 'viewer'
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      tournament_type: 'single_elimination' | 'round_robin' | 'swiss'
      tournament_status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
      match_status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'postponed'
      surface_type: 'clay' | 'hard' | 'grass' | 'synthetic'
      user_role: 'admin' | 'player' | 'viewer'
      ranking_type: 'overall' | 'tournament' | 'seasonal'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}