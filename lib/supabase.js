// Cliente simple de Supabase para los componentes
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Faltan variables de entorno de Supabase')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// Funciones helper para storage de imágenes
export const storageAPI = {
  // Subir imagen de avatar
  async uploadAvatar(file, playerId) {
    const fileExt = file.name.split('.').pop()
    const fileName = `${playerId}-${Date.now()}.${fileExt}`
    const filePath = `avatars/${fileName}`

    const { data, error } = await supabase.storage
      .from('player-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Error uploading avatar:', error)
      throw new Error(`Error subiendo imagen: ${error.message}`)
    }

    // Obtener URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('player-images')
      .getPublicUrl(filePath)

    return {
      path: filePath,
      url: publicUrl
    }
  },

  // Eliminar imagen anterior
  async deleteAvatar(filePath) {
    const { error } = await supabase.storage
      .from('player-images')
      .remove([filePath])

    if (error) {
      console.error('Error deleting avatar:', error)
      throw new Error(`Error eliminando imagen: ${error.message}`)
    }
  },

  // Obtener URL pública de una imagen
  getPublicUrl(filePath) {
    const { data: { publicUrl } } = supabase.storage
      .from('player-images')
      .getPublicUrl(filePath)
    
    return publicUrl
  }
}

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
  async create(playerData, avatarFile = null) {
    // Primero verificar si el email ya existe
    const { data: existingPlayer, error: checkError } = await supabase
      .from('playerss')
      .select('id, email')
      .eq('email', playerData.email)
      .eq('is_active', true)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 es "no rows returned", que es lo que esperamos
      console.error('Error verificando email:', checkError)
      throw new Error(`Error verificando email: ${checkError.message}`)
    }

    if (existingPlayer) {
      throw new Error(`Ya existe un jugador activo con el email: ${playerData.email}`)
    }

    // Crear el jugador
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
      // Mensaje más específico para errores de duplicado
      if (error.code === '23505' && error.message.includes('email')) {
        throw new Error(`Ya existe un jugador con el email: ${playerData.email}`)
      }
      throw new Error(`Error creando jugador: ${error.message}`)
    }

    // Si hay un archivo de avatar, subirlo
    if (avatarFile && data.id) {
      try {
        const uploadResult = await storageAPI.uploadAvatar(avatarFile, data.id)
        
        // Actualizar el jugador con la URL del avatar
        const { error: updateError } = await supabase
          .from('playerss')
          .update({ 
            avatar_url: uploadResult.url,
            avatar_path: uploadResult.path,
            updated_at: new Date().toISOString()
          })
          .eq('id', data.id)

        if (updateError) {
          console.error('Error actualizando avatar en BD:', updateError)
          // No lanzar error, el jugador ya fue creado
        } else {
          data.avatar_url = uploadResult.url
          data.avatar_path = uploadResult.path
        }
      } catch (uploadError) {
        console.error('Error subiendo avatar:', uploadError)
        // No lanzar error, el jugador ya fue creado
      }
    }
    
    return data
  },

  // Actualizar un jugador
  async update(id, playerData, avatarFile = null) {
    // Primero obtener los datos actuales del jugador
    const { data: currentPlayer, error: fetchError } = await supabase
      .from('playerss')
      .select('avatar_path, email')
      .eq('id', id)
      .single()

    if (fetchError) {
      console.error('Error obteniendo jugador actual:', fetchError)
      throw new Error(`Error obteniendo jugador: ${fetchError.message}`)
    }

    // Verificar si el email ya existe en otro jugador (solo si se está cambiando el email)
    if (playerData.email && playerData.email !== currentPlayer.email) {
      const { data: existingPlayer, error: checkError } = await supabase
        .from('playerss')
        .select('id, email')
        .eq('email', playerData.email)
        .eq('is_active', true)
        .neq('id', id) // Excluir el jugador actual
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error verificando email:', checkError)
        throw new Error(`Error verificando email: ${checkError.message}`)
      }

      if (existingPlayer) {
        throw new Error(`Ya existe otro jugador activo con el email: ${playerData.email}`)
      }
    }

    let updateData = {
      name: playerData.name,
      email: playerData.email,
      phone: playerData.phone,
      favorite_shot: playerData.favoriteShot,
      playing_style: playerData.playingStyle,
      updated_at: new Date().toISOString()
    }

    // Si hay un nuevo archivo de avatar
    if (avatarFile) {
      try {
        // Eliminar avatar anterior si existe
        if (currentPlayer.avatar_path) {
          await storageAPI.deleteAvatar(currentPlayer.avatar_path)
        }

        // Subir nuevo avatar
        const uploadResult = await storageAPI.uploadAvatar(avatarFile, id)
        updateData.avatar_url = uploadResult.url
        updateData.avatar_path = uploadResult.path
      } catch (uploadError) {
        console.error('Error manejando avatar:', uploadError)
        // Continuar con la actualización sin avatar si falla
      }
    }

    const { data, error } = await supabase
      .from('playerss')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Error actualizando jugador:', error)
      // Mensaje más específico para errores de duplicado
      if (error.code === '23505' && error.message.includes('email')) {
        throw new Error(`Ya existe otro jugador con el email: ${playerData.email}`)
      }
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