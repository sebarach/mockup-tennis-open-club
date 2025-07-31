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

// Funciones helper para torneos
export const tournamentsAPI = {
  // Obtener todos los torneos
  async getAll() {
    const { data, error } = await supabase
      .from('tournaments')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error obteniendo torneos:', error)
      throw new Error(`Error obteniendo torneos: ${error.message}`)
    }
    
    return data || []
  },

  // Crear un nuevo torneo
  async create(tournamentData) {
    try {
      // Validaciones básicas
      if (!tournamentData.name || !tournamentData.start_date || !tournamentData.end_date) {
        throw new Error('Campos obligatorios faltantes: nombre, fecha de inicio y fecha de fin')
      }

      // Obtener usuario actual o usar un UUID por defecto
      let organizerId = tournamentData.organizer_id
      
      if (!organizerId) {
        // Intentar obtener el usuario autenticado
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          organizerId = user.id
        } else {
          // Solución temporal para desarrollo: usar un UUID fijo
          // IMPORTANTE: En producción debes implementar autenticación apropiada
          organizerId = '550e8400-e29b-41d4-a716-446655440000' // UUID fijo para desarrollo
          console.warn('⚠️ Usando UUID temporal para desarrollo. Implementa autenticación en producción.')
        }
      }

      console.log('Creando torneo con datos:', tournamentData)
      console.log('Organizer ID:', organizerId)

      // Crear datos del torneo simplificados
      const tournamentInsert = {
        name: tournamentData.name,
        description: tournamentData.description || null,
        start_date: new Date(tournamentData.start_date).toISOString(),
        end_date: new Date(tournamentData.end_date).toISOString(),
        registration_deadline: new Date(tournamentData.registration_deadline).toISOString(),
        max_players: tournamentData.max_players || 16,
        entry_fee: tournamentData.entry_fee || null,
        prize_pool: tournamentData.prize_pool || null,
        tournament_type: tournamentData.tournament_type || 'single_elimination',
        status: tournamentData.status || 'upcoming',
        location: tournamentData.location || null,
        rules: tournamentData.rules || null,
        organizer_id: organizerId,
        is_active: true
      }

      console.log('Datos a insertar:', tournamentInsert)

      const { data, error } = await supabase
        .from('tournaments')
        .insert([tournamentInsert])
        .select()
        .single()
      
      if (error) {
        console.error('Error de Supabase:', error)
        console.error('Código de error:', error.code)
        console.error('Detalles:', error.details)
        console.error('Hint:', error.hint)
        
        // Mensajes de error más específicos
        if (error.code === '42P01') {
          throw new Error('La tabla "tournaments" no existe en la base de datos. Por favor, créala primero.')
        } else if (error.code === '42703') {
          throw new Error(`Columna no encontrada: ${error.message}. Verifica que todas las columnas existan en la tabla.`)
        } else if (error.code === '23505') {
          throw new Error('Ya existe un torneo con ese nombre.')
        } else if (error.code === '23514') {
          // Check constraint violation
          if (error.message.includes('max_players')) {
            throw new Error('El número máximo de jugadores debe estar entre 2 y 128.')
          } else if (error.message.includes('valid_dates')) {
            throw new Error('Las fechas no son válidas. La fecha de fin debe ser posterior al inicio y la fecha límite de inscripción debe ser anterior al inicio.')
          } else if (error.message.includes('tournament_type')) {
            throw new Error('Tipo de torneo no válido. Debe ser: single_elimination, round_robin o swiss.')
          } else if (error.message.includes('status')) {
            throw new Error('Estado del torneo no válido. Debe ser: upcoming, ongoing, completed o cancelled.')
          } else {
            throw new Error(`Constraint violation: ${error.message}`)
          }
        } else if (error.code === '23502') {
          throw new Error(`Campo requerido faltante: ${error.message}`)
        } else if (error.code === '23503') {
          throw new Error('Usuario organizador no válido. Debes estar autenticado.')
        } else {
          throw new Error(`Error creando torneo: ${error.message} (Código: ${error.code})`)
        }
      }
      
      console.log('Torneo creado exitosamente:', data)
      return data
    } catch (error) {
      console.error('Error en create tournament:', error)
      throw error
    }
  },

  // Actualizar un torneo
  async update(id, tournamentData) {
    const { data, error } = await supabase
      .from('tournaments')
      .update({
        ...tournamentData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Error actualizando torneo:', error)
      throw new Error(`Error actualizando torneo: ${error.message}`)
    }
    
    return data
  },

  // Eliminar (soft delete) un torneo
  async delete(id) {
    const { data, error } = await supabase
      .from('tournaments')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Error eliminando torneo:', error)
      throw new Error(`Error eliminando torneo: ${error.message}`)
    }
    
    return data
  },

  // Obtener torneos por estado
  async getByStatus(status) {
    const { data, error } = await supabase
      .from('tournaments')
      .select('*')
      .eq('status', status)
      .eq('is_active', true)
      .order('start_date', { ascending: true })
    
    if (error) {
      console.error('Error obteniendo torneos por estado:', error)
      throw new Error(`Error obteniendo torneos: ${error.message}`)
    }
    
    return data || []
  },

  // Obtener estadísticas de torneos
  async getStats() {
    try {
      const { data: tournaments, error } = await supabase
        .from('tournaments')
        .select('*')
        .eq('is_active', true)

      if (error) throw error

      const totalTournaments = tournaments?.length || 0
      const totalPrizePool = tournaments?.reduce((sum, t) => sum + (t.prize_pool || 0), 0) || 0
      
      // TODO: Calcular participantes únicos y partidos jugados desde matches
      const uniqueParticipants = 0
      const matchesPlayed = 0

      return {
        totalTournaments,
        uniqueParticipants,
        totalPrizePool,
        matchesPlayed
      }
    } catch (error) {
      console.error('Error obteniendo estadísticas de torneos:', error)
      throw new Error(`Error obteniendo estadísticas: ${error.message}`)
    }
  }
}

// Funciones helper para inscripciones de torneos
export const tournamentRegistrationsAPI = {
  // Obtener jugadores inscritos en un torneo
  async getPlayersByTournament(tournamentId) {
    const { data, error } = await supabase
      .from('tournament_registrations')
      .select(`
        id,
        registration_date,
        status,
        notes,
        player_id,
        playerss!inner (
          id,
          name,
          email,
          ranking,
          points,
          wins,
          losses,
          avatar_url,
          playing_style,
          favorite_shot
        )
      `)
      .eq('tournament_id', tournamentId)
      .eq('is_active', true)
      .eq('status', 'registered')
      .order('registration_date', { ascending: true })
    
    if (error) {
      console.error('Error obteniendo jugadores del torneo:', error)
      throw new Error(`Error obteniendo jugadores: ${error.message}`)
    }
    
    // Transformar datos para que sea más fácil trabajar con ellos
    return (data || []).map(registration => ({
      ...registration.playerss,
      registration_id: registration.id,
      registration_date: registration.registration_date,
      registration_status: registration.status,
      registration_notes: registration.notes
    }))
  },

  // Obtener torneos de un jugador
  async getTournamentsByPlayer(playerId) {
    const { data, error } = await supabase
      .from('tournament_registrations')
      .select(`
        id,
        registration_date,
        status,
        notes,
        tournament_id,
        tournaments!inner (
          id,
          name,
          description,
          start_date,
          end_date,
          tournament_type,
          status,
          max_players,
          entry_fee,
          prize_pool,
          location
        )
      `)
      .eq('player_id', playerId)
      .eq('is_active', true)
      .order('registration_date', { ascending: false })
    
    if (error) {
      console.error('Error obteniendo torneos del jugador:', error)
      throw new Error(`Error obteniendo torneos: ${error.message}`)
    }
    
    return (data || []).map(registration => ({
      ...registration.tournaments,
      registration_id: registration.id,
      registration_date: registration.registration_date,
      registration_status: registration.status,
      registration_notes: registration.notes
    }))
  },

  // Inscribir jugador(es) en un torneo
  async registerPlayers(tournamentId, playerIds) {
    try {
      // Validar que el torneo existe y está en estado 'upcoming'
      const { data: tournament, error: tournamentError } = await supabase
        .from('tournaments')
        .select('id, name, status, max_players')
        .eq('id', tournamentId)
        .eq('is_active', true)
        .single()

      if (tournamentError) {
        console.error('Error obteniendo torneo:', tournamentError)
        throw new Error(`Torneo no encontrado: ${tournamentError.message}`)
      }

      if (tournament.status !== 'upcoming') {
        throw new Error('Solo se pueden inscribir jugadores en torneos con estado "Próximo"')
      }

      // Verificar cuántos jugadores ya están inscritos
      const currentRegistrations = await this.getPlayersByTournament(tournamentId)
      const availableSlots = tournament.max_players - currentRegistrations.length

      if (playerIds.length > availableSlots) {
        throw new Error(`Solo quedan ${availableSlots} cupos disponibles en el torneo "${tournament.name}"`)
      }

      // Verificar que los jugadores no estén ya inscritos
      const { data: existingRegistrations, error: checkError } = await supabase
        .from('tournament_registrations')
        .select('player_id')
        .eq('tournament_id', tournamentId)
        .eq('is_active', true)
        .in('player_id', playerIds)

      if (checkError) {
        console.error('Error verificando inscripciones existentes:', checkError)
        throw new Error(`Error verificando inscripciones: ${checkError.message}`)
      }

      if (existingRegistrations && existingRegistrations.length > 0) {
        const alreadyRegistered = existingRegistrations.map(r => r.player_id)
        throw new Error(`Algunos jugadores ya están inscritos en este torneo`)
      }

      // Crear las inscripciones
      const registrations = playerIds.map(playerId => ({
        tournament_id: tournamentId,
        player_id: playerId,
        status: 'registered',
        is_active: true
      }))

      const { data, error } = await supabase
        .from('tournament_registrations')
        .insert(registrations)
        .select()
      
      if (error) {
        console.error('Error inscribiendo jugadores:', error)
        
        // Mensajes de error más específicos
        if (error.code === '23505') {
          throw new Error('Uno o más jugadores ya están inscritos en este torneo')
        } else if (error.code === '23503') {
          throw new Error('Jugador o torneo no válido')
        } else {
          throw new Error(`Error inscribiendo jugadores: ${error.message}`)
        }
      }
      
      console.log('Jugadores inscritos exitosamente:', data)
      return data
    } catch (error) {
      console.error('Error en registerPlayers:', error)
      throw error
    }
  },

  // Desinscribir jugador de un torneo (soft delete)
  async unregisterPlayer(tournamentId, playerId) {
    const { data, error } = await supabase
      .from('tournament_registrations')
      .update({ 
        status: 'withdrawn',
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('tournament_id', tournamentId)
      .eq('player_id', playerId)
      .eq('is_active', true)
      .select()
    
    if (error) {
      console.error('Error desinscribiendo jugador:', error)
      throw new Error(`Error desinscribiendo jugador: ${error.message}`)
    }
    
    return data
  },

  // Obtener estadísticas de inscripciones de un torneo
  async getTournamentRegistrationStats(tournamentId) {
    const { data, error } = await supabase
      .from('tournament_registrations')
      .select('status')
      .eq('tournament_id', tournamentId)
      .eq('is_active', true)
    
    if (error) {
      console.error('Error obteniendo estadísticas:', error)
      throw new Error(`Error obteniendo estadísticas: ${error.message}`)
    }
    
    const stats = {
      total: data?.length || 0,
      registered: data?.filter(r => r.status === 'registered').length || 0,
      withdrawn: data?.filter(r => r.status === 'withdrawn').length || 0,
      disqualified: data?.filter(r => r.status === 'disqualified').length || 0
    }
    
    return stats
  },

  // Verificar si un jugador está inscrito en un torneo
  async isPlayerRegistered(tournamentId, playerId) {
    const { data, error } = await supabase
      .from('tournament_registrations')
      .select('id, status')
      .eq('tournament_id', tournamentId)
      .eq('player_id', playerId)
      .eq('is_active', true)
      .single()
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error verificando inscripción:', error)
      throw new Error(`Error verificando inscripción: ${error.message}`)
    }
    
    return {
      isRegistered: !!data,
      status: data?.status || null
    }
  }
}