// Cliente simple de Supabase para los componentes
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Faltan variables de entorno de Supabase')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// Funciones helper para jugadores
export const playersAPI = {
  // Obtener todos los jugadores
  async getAll() {
    const { data, error } = await supabase
      .from('playerss')
      .select('*')
      .eq('is_active', true)
      .order('ranking', { ascending: true, nullsLast: true })
    
    if (error) {
      console.error('Error obteniendo jugadores:', error)
      throw new Error(`Error obteniendo jugadores: ${error.message}`)
    }
    
    return data || []
  },

  // Crear un nuevo jugador
  async create(playerData) {
    const { data, error } = await supabase
      .from('playerss')
      .insert([{
        name: playerData.name,
        email: playerData.email,
        phone: playerData.phone,
        favorite_shot: playerData.favoriteShot,
        playing_style: playerData.playingStyle,
        points: playerData.points || 0,
        matches_played: 0,
        wins: 0,
        losses: 0,
        win_rate: 0,
        join_date: new Date().toISOString().split('T')[0],
        achievements: playerData.achievements || [],
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single()
    
    if (error) {
      console.error('Error creando jugador:', error)
      throw new Error(`Error creando jugador: ${error.message}`)
    }
    
    return data
  },

  // Actualizar un jugador
  async update(id, playerData) {
    const { data, error } = await supabase
      .from('playerss')
      .update({
        name: playerData.name,
        email: playerData.email,
        phone: playerData.phone,
        favorite_shot: playerData.favoriteShot,
        playing_style: playerData.playingStyle,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Error actualizando jugador:', error)
      throw new Error(`Error actualizando jugador: ${error.message}`)
    }
    
    return data
  },

  // Eliminar (soft delete) un jugador
  async delete(id) {
    const { data, error } = await supabase
      .from('playerss')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Error eliminando jugador:', error)
      throw new Error(`Error eliminando jugador: ${error.message}`)
    }
    
    return data
  }
}