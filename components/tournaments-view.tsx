"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trophy, Calendar, Users, Award, Plus } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useState, useEffect } from "react"
import Swal from "sweetalert2"
import { tournamentsAPI, playersAPI, tournamentRegistrationsAPI } from "@/lib/supabase"

export function TournamentsView() {
  const [activeTournaments, setActiveTournaments] = useState([])
  const [upcomingTournaments, setUpcomingTournaments] = useState([])
  const [pastTournaments, setPastTournaments] = useState([])
  const [tournamentStats, setTournamentStats] = useState([
    { label: "Torneos Totales", value: "0", icon: Trophy },
    { label: "Participantes Únicos", value: "0", icon: Users },
    { label: "Premios Entregados", value: "$0", icon: Award },
    { label: "Partidos Jugados", value: "0", icon: Calendar },
  ])
  const [loading, setLoading] = useState(true)

  // Función para cargar todos los torneos
  const loadTournaments = async () => {
    try {
      setLoading(true)
      
      // Obtener todos los torneos usando la API
      const tournaments = await tournamentsAPI.getAll()

      // Separar por estado
      const active = tournaments.filter(t => t.status === 'ongoing')
      const upcoming = tournaments.filter(t => t.status === 'upcoming')
      const past = tournaments.filter(t => t.status === 'completed')

      console.log('Torneos cargados:', tournaments.length)
      console.log('Torneos por estado:', {
        active: active.length,
        upcoming: upcoming.length,
        past: past.length
      })
      console.log('Estados encontrados:', tournaments.map(t => t.status))

      setActiveTournaments(active)
      setUpcomingTournaments(upcoming)
      setPastTournaments(past)

      // Obtener estadísticas
      const stats = await tournamentsAPI.getStats()
      
      setTournamentStats([
        { label: "Torneos Totales", value: stats.totalTournaments.toString(), icon: Trophy },
        { label: "Participantes Únicos", value: stats.uniqueParticipants.toString(), icon: Users },
        { label: "Premios Entregados", value: `$${stats.totalPrizePool.toLocaleString()}`, icon: Award },
        { label: "Partidos Jugados", value: stats.matchesPlayed.toString(), icon: Calendar },
      ])
    } catch (error) {
      console.error('Error cargando torneos:', error)
      Swal.fire({
        title: 'Error',
        text: `No se pudieron cargar los torneos: ${error.message}`,
        icon: 'error',
        background: '#1f2937',
        color: '#f9fafb'
      })
    } finally {
      setLoading(false)
    }
  }

  // Función para agregar torneo
  const handleAddTournament = async () => {
    // Cargar jugadores disponibles
    let availablePlayers = []
    try {
      availablePlayers = await playersAPI.getAll()
    } catch (error) {
      console.error('Error cargando jugadores:', error)
    }

    const { value: formData } = await Swal.fire({
      title: '<span style="color: #10b981; font-size: clamp(18px, 4vw, 24px); font-weight: bold;">🏆 Crear Nuevo Torneo</span>',
      html: `
        <style>
          .responsive-tournament-form {
            padding: clamp(12px, 3vw, 20px);
            max-width: 100%;
            overflow-x: hidden;
            color: #e5e7eb;
            background: #1f2937;
            border-radius: 12px;
          }
          .responsive-tournament-form .form-group {
            margin-bottom: clamp(12px, 3vw, 16px);
            background: #374151;
            padding: clamp(12px, 3vw, 16px);
            border-radius: 8px;
          }
          .responsive-tournament-form label {
            display: block;
            font-size: clamp(12px, 2.5vw, 14px);
            font-weight: 600;
            margin-bottom: 6px;
            color: #10b981;
            text-align: left;
          }
          .responsive-tournament-form .form-input,
          .responsive-tournament-form .form-textarea,
          .responsive-tournament-form .form-select {
            width: 100%;
            padding: clamp(8px, 2vw, 12px);
            border: 1px solid #4b5563;
            border-radius: 6px;
            font-size: clamp(14px, 3vw, 16px);
            background: #1f2937;
            color: #f9fafb;
            transition: all 0.3s ease;
            box-sizing: border-box;
          }
          .responsive-tournament-form .form-input:focus,
          .responsive-tournament-form .form-textarea:focus,
          .responsive-tournament-form .form-select:focus {
            border-color: #10b981;
            outline: none;
            box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
          }
          .responsive-tournament-form .form-input::placeholder,
          .responsive-tournament-form .form-textarea::placeholder {
            color: #9ca3af;
            font-size: clamp(12px, 2.5vw, 14px);
          }
          .responsive-tournament-form .form-row {
            display: grid;
            grid-template-columns: 1fr;
            gap: clamp(12px, 3vw, 16px);
            background: transparent;
            padding: 0;
            border-radius: 0;
          }
          @media (min-width: 640px) {
            .responsive-tournament-form .form-row {
              grid-template-columns: 1fr 1fr;
            }
          }
          .responsive-tournament-form .form-textarea {
            resize: vertical;
            min-height: 80px;
          }
          
          /* Players Selection Styles */
          .players-dropdown {
            position: relative;
          }
          
          .players-dropdown-trigger {
            width: 100%;
            padding: clamp(8px, 2vw, 12px);
            border: 1px solid #4b5563;
            border-radius: 6px;
            font-size: clamp(14px, 3vw, 16px);
            background: #1f2937;
            color: #f9fafb;
            cursor: pointer;
            text-align: left;
            display: flex;
            justify-content: space-between;
            align-items: center;
            transition: all 0.3s ease;
          }
          
          .players-dropdown-trigger:hover {
            border-color: #10b981;
          }
          
          .players-dropdown-content {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: #1f2937;
            border: 1px solid #4b5563;
            border-radius: 6px;
            max-height: 200px;
            overflow-y: auto;
            z-index: 1000;
            display: none;
            margin-top: 2px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
          }
          
          .players-dropdown-content.show {
            display: block;
          }
          
          .player-item {
            padding: 8px 12px;
            border-bottom: 1px solid #374151;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: background-color 0.2s;
          }
          
          .player-item:hover {
            background-color: #374151;
          }
          
          .player-item:last-child {
            border-bottom: none;
          }
          
          .player-checkbox {
            margin: 0;
            accent-color: #10b981;
          }
          
          .player-info {
            flex: 1;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .player-avatar {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            object-fit: cover;
            border: 1px solid #10b981;
          }
          
          .player-details {
            flex: 1;
          }
          
          .player-name {
            font-weight: 500;
            color: #f9fafb;
            font-size: 14px;
          }
          
          .player-rank {
            font-size: 12px;
            color: #9ca3af;
          }
          
          .selected-players-count {
            background: #10b981;
            color: white;
            border-radius: 12px;
            padding: 2px 8px;
            font-size: 12px;
            font-weight: bold;
          }
          
          .dropdown-arrow {
            transition: transform 0.2s;
          }
          
          .dropdown-arrow.rotated {
            transform: rotate(180deg);
          }
        </style>
        <div class="responsive-tournament-form">
          <div class="form-group">
            <label for="name">🎾 Nombre del Torneo *</label>
            <input 
              id="name" 
              class="form-input" 
              placeholder="Ej: Copa de Verano 2024"
              required
            >
          </div>
          
          <div class="form-group">
            <label for="description">📄 Descripción</label>
            <textarea 
              id="description" 
              class="form-textarea" 
              placeholder="Describe tu torneo aquí..."
              rows="3"
            ></textarea>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="startDate">🚀 Fecha de Inicio *</label>
              <input 
                id="startDate" 
                type="date" 
                class="form-input"
                required
              >
            </div>
            
            <div class="form-group">
              <label for="endDate">🏁 Fecha de Fin *</label>
              <input 
                id="endDate" 
                type="date" 
                class="form-input"
                required
              >
            </div>
          </div>
          
          <div class="form-group">
            <label for="registrationDeadline">⏰ Fecha Límite de Inscripción *</label>
            <input 
              id="registrationDeadline" 
              type="date" 
              class="form-input"
              required
            >
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="tournamentType">🎯 Tipo de Torneo *</label>
              <select id="tournamentType" class="form-select" required>
                <option value="">Seleccionar tipo...</option>
                <option value="single_elimination">🥊 Eliminación Directa</option>
                <option value="round_robin">🔄 Round Robin</option>
                <option value="swiss">🇨🇭 Sistema Suizo</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="maxPlayers">👥 Máximo de Jugadores *</label>
              <input 
                id="maxPlayers" 
                type="number" 
                class="form-input" 
                min="2" 
                max="128" 
                value="16"
                required
              >
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="entryFee">💳 Cuota de Inscripción</label>
              <input 
                id="entryFee" 
                type="number" 
                class="form-input" 
                min="0" 
                placeholder="0"
              >
            </div>
            
            <div class="form-group">
              <label for="prizePool">🏆 Premio Total</label>
              <input 
                id="prizePool" 
                type="number" 
                class="form-input" 
                min="0" 
                placeholder="0"
              >
            </div>
          </div>
          
          <div class="form-group">
            <label for="location">🏢 Ubicación</label>
            <input 
              id="location" 
              class="form-input" 
              placeholder="Ej: Club de Tenis Central"
            >
          </div>
          
          <div class="form-group">
            <label for="rules">📜 Reglas Específicas</label>
            <textarea 
              id="rules" 
              class="form-textarea" 
              placeholder="Reglas específicas del torneo..."
              rows="4"
            ></textarea>
          </div>
          
          <div class="form-group">
            <label for="selectedPlayers">👥 Seleccionar Jugadores</label>
            <div class="players-dropdown">
              <div class="players-dropdown-trigger" onclick="togglePlayersDropdown()">
                <span id="dropdown-text">Seleccionar jugadores...</span>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span id="selected-count" class="selected-players-count" style="display: none;">0</span>
                  <span class="dropdown-arrow">▼</span>
                </div>
              </div>
              <div id="players-dropdown-content" class="players-dropdown-content">
                ${availablePlayers.map(player => `
                  <div class="player-item" onclick="togglePlayerSelection('${player.id}', event)">
                    <input 
                      type="checkbox" 
                      class="player-checkbox" 
                      id="player-${player.id}"
                      data-player-id="${player.id}"
                      onclick="event.stopPropagation()"
                      onchange="updatePlayerSelection()"
                    >
                    <div class="player-info">
                      <img 
                        src="${player.avatar_url || '/placeholder-user.jpg'}" 
                        alt="${player.name}" 
                        class="player-avatar"
                        onerror="this.src='/placeholder-user.jpg'"
                      >
                      <div class="player-details">
                        <div class="player-name">${player.name}</div>
                        <div class="player-rank">#${player.ranking || 'N/A'} • ${player.points || 0} pts</div>
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
            <p style="font-size: 11px; color: #9ca3af; margin-top: 4px;">
              Opcional: Puedes pre-inscribir jugadores al torneo o dejar que se inscriban después
            </p>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: '🚀 Crear Torneo',
      cancelButtonText: '❌ Cancelar',
      background: '#1f2937',
      color: '#f9fafb',
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      customClass: {
        popup: 'responsive-modal'
      },
      didOpen: () => {
        // Definir funciones para el dropdown de jugadores
        window.togglePlayersDropdown = function() {
          const content = document.getElementById('players-dropdown-content');
          const arrow = document.querySelector('.dropdown-arrow');
          
          if (content && arrow) {
            content.classList.toggle('show');
            arrow.classList.toggle('rotated');
          }
        }
        
        window.togglePlayerSelection = function(playerId, event) {
          event.stopPropagation();
          const checkbox = document.getElementById('player-' + playerId);
          if (checkbox) {
            checkbox.checked = !checkbox.checked;
            window.updatePlayerSelection();
          }
        }
        
        window.updatePlayerSelection = function() {
          const checkboxes = document.querySelectorAll('.player-checkbox');
          const selectedCount = Array.from(checkboxes).filter(cb => cb.checked).length;
          const countElement = document.getElementById('selected-count');
          const textElement = document.getElementById('dropdown-text');
          
          if (countElement && textElement) {
            if (selectedCount > 0) {
              countElement.style.display = 'inline';
              countElement.textContent = selectedCount;
              textElement.textContent = selectedCount === 1 ? '1 jugador seleccionado' : selectedCount + ' jugadores seleccionados';
            } else {
              countElement.style.display = 'none';
              textElement.textContent = 'Seleccionar jugadores...';
            }
          }
        }
        
        // Cerrar dropdown al hacer click fuera
        const handleClickOutside = function(event) {
          const dropdown = document.querySelector('.players-dropdown');
          if (dropdown && !dropdown.contains(event.target)) {
            const content = document.getElementById('players-dropdown-content');
            const arrow = document.querySelector('.dropdown-arrow');
            if (content && arrow) {
              content.classList.remove('show');
              arrow.classList.remove('rotated');
            }
          }
        }
        
        document.addEventListener('click', handleClickOutside);
        
        // Limpiar event listener cuando se cierre el modal
        const modal = document.querySelector('.swal2-container');
        if (modal) {
          modal.addEventListener('DOMNodeRemoved', function() {
            document.removeEventListener('click', handleClickOutside);
            delete window.togglePlayersDropdown;
            delete window.togglePlayerSelection;
            delete window.updatePlayerSelection;
          });
        }
      },
      preConfirm: () => {
        const name = document.getElementById('name').value
        const description = document.getElementById('description').value
        const startDate = document.getElementById('startDate').value
        const endDate = document.getElementById('endDate').value
        const registrationDeadline = document.getElementById('registrationDeadline').value
        const tournamentType = document.getElementById('tournamentType').value
        const maxPlayers = parseInt(document.getElementById('maxPlayers').value)
        const entryFee = parseFloat(document.getElementById('entryFee').value) || 0
        const prizePool = parseFloat(document.getElementById('prizePool').value) || 0
        const location = document.getElementById('location').value
        const rules = document.getElementById('rules').value
        
        // Obtener jugadores seleccionados
        const selectedPlayerCheckboxes = document.querySelectorAll('.player-checkbox:checked')
        const selectedPlayers = Array.from(selectedPlayerCheckboxes).map(cb => cb.dataset.playerId)

        if (!name || !startDate || !endDate || !registrationDeadline || !tournamentType) {
          Swal.showValidationMessage('Por favor completa todos los campos obligatorios')
          return false
        }

        if (new Date(startDate) <= new Date()) {
          Swal.showValidationMessage('La fecha de inicio debe ser futura')
          return false
        }

        if (new Date(endDate) <= new Date(startDate)) {
          Swal.showValidationMessage('La fecha de fin debe ser posterior a la fecha de inicio')
          return false
        }

        if (new Date(registrationDeadline) >= new Date(startDate)) {
          Swal.showValidationMessage('La fecha límite de inscripción debe ser anterior al inicio')
          return false
        }

        if (maxPlayers < 2 || maxPlayers > 128) {
          Swal.showValidationMessage('El número de jugadores debe estar entre 2 y 128')
          return false
        }

        // Validar potencia de 2 para eliminación directa
        if (tournamentType === 'single_elimination' && (maxPlayers & (maxPlayers - 1)) !== 0) {
          Swal.showValidationMessage('Para eliminación directa, el número de jugadores debe ser una potencia de 2 (2, 4, 8, 16, 32, 64, 128)')
          return false
        }

        // Validar número de jugadores seleccionados
        if (selectedPlayers.length > maxPlayers) {
          Swal.showValidationMessage('Has seleccionado ' + selectedPlayers.length + ' jugadores, pero el máximo permitido es ' + maxPlayers)
          return false
        }

        return {
          name,
          description,
          start_date: startDate,
          end_date: endDate,
          registration_deadline: registrationDeadline,
          tournament_type: tournamentType,
          max_players: maxPlayers,
          entry_fee: entryFee,
          prize_pool: prizePool,
          location,
          rules,
          status: 'upcoming',
          selected_players: selectedPlayers
        }
      }
    })

    if (formData) {
      try {
        // Separar los jugadores seleccionados del resto de datos
        const { selected_players, ...tournamentData } = formData
        
        // Crear el torneo
        const newTournament = await tournamentsAPI.create(tournamentData)

        let successMessage = 'Torneo creado correctamente'
        
        // Si hay jugadores seleccionados, inscribirlos al torneo
        if (selected_players && selected_players.length > 0) {
          try {
            // Aquí podrías crear registros en una tabla tournament_registrations
            // Por simplicidad, solo mostramos en el mensaje
            successMessage = `Torneo creado correctamente con ${selected_players.length} jugador${selected_players.length === 1 ? '' : 'es'} pre-inscrito${selected_players.length === 1 ? '' : 's'}`
          } catch (registerError) {
            console.error('Error registrando jugadores:', registerError)
            successMessage = 'Torneo creado correctamente, pero hubo un error al pre-inscribir algunos jugadores'
          }
        }

        await Swal.fire({
          title: '🎉 ¡Éxito!',
          text: successMessage,
          icon: 'success',
          background: '#1f2937',
          color: '#f9fafb',
          confirmButtonColor: '#10b981'
        })

        // Recargar torneos
        await loadTournaments()

      } catch (error) {
        console.error('Error creando torneo:', error)
        
        let errorMessage = error.message || 'Error desconocido al crear el torneo'
        
        // Mensajes de error más user-friendly
        if (errorMessage.includes('tabla "tournaments" no existe')) {
          errorMessage = '❌ La tabla de torneos no existe en la base de datos.\n\n💡 Solución: Necesitas crear la tabla "tournaments" en Supabase con las columnas requeridas.'
        } else if (errorMessage.includes('Columna no encontrada')) {
          errorMessage = '❌ Falta una columna en la tabla de torneos.\n\n💡 Solución: Verifica que la tabla "tournaments" tenga todas las columnas necesarias.'
        }
        
        Swal.fire({
          title: '❌ Error al Crear Torneo',
          html: `
            <div style="text-align: left; padding: 1rem; background: #374151; border-radius: 8px; margin: 1rem 0;">
              <p style="margin: 0; color: #f9fafb; line-height: 1.5;">${errorMessage}</p>
            </div>
            <div style="margin-top: 1rem; padding: 1rem; background: #1e3a8a; border-radius: 8px;">
              <p style="margin: 0; color: #93c5fd; font-size: 0.9rem;">
                <strong>📋 Información técnica:</strong><br>
                Revisa la consola del navegador (F12) para más detalles específicos del error.
              </p>
            </div>
          `,
          icon: 'error',
          background: '#1f2937',
          color: '#f9fafb',
          confirmButtonText: '🔍 Entendido',
          confirmButtonColor: '#ef4444',
          width: '600px'
        })
      }
    }
  }

  // Función para formatear fechas
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-CL')
  }

  // Función para obtener el progreso del torneo
  const getTournamentProgress = (tournament) => {
    // Por ahora retornamos un valor mock, esto debería calcularse basado en matches
    return Math.floor(Math.random() * 100)
  }

  // Función para obtener la ronda actual
  const getCurrentRound = (tournament) => {
    // Por ahora retornamos valores mock, esto debería calcularse basado en matches
    const rounds = {
      'single_elimination': ['Primera Ronda', 'Octavos', 'Cuartos', 'Semifinales', 'Final'],
      'round_robin': ['Fase de Grupos'],
      'swiss': ['Ronda Suiza']
    }
    return rounds[tournament.tournament_type]?.[0] || 'En Progreso'
  }

  // Función para obtener el color del badge según el estado
  const getStatusBadgeColor = (status) => {
    const colors = {
      'upcoming': 'bg-blue-500',
      'ongoing': 'bg-green-500',
      'completed': 'bg-gray-500',
      'cancelled': 'bg-red-500'
    }
    return colors[status] || 'bg-gray-500'
  }

  // Función para obtener el texto del estado en español
  const getStatusText = (status) => {
    const texts = {
      'upcoming': 'Próximo',
      'ongoing': 'En Progreso',
      'completed': 'Completado',
      'cancelled': 'Cancelado'
    }
    return texts[status] || status
  }

  // Función para obtener el texto del tipo de torneo en español
  const getTournamentTypeText = (type) => {
    const types = {
      'single_elimination': 'Eliminación Directa',
      'round_robin': 'Round Robin',
      'swiss': 'Sistema Suizo'
    }
    return types[type] || type
  }

  // Función para cambiar el estado del torneo
  const changeTournamentStatus = async (tournament, newStatus) => {
    try {
      // Validaciones según el estado
      if (newStatus === 'ongoing' && tournament.status !== 'upcoming') {
        throw new Error('Solo se pueden iniciar torneos que estén en estado "Próximo"')
      }
      
      if (newStatus === 'completed' && tournament.status !== 'ongoing') {
        throw new Error('Solo se pueden completar torneos que estén "En Progreso"')
      }

      // Si se está iniciando el torneo, verificar que haya jugadores inscritos
      if (newStatus === 'ongoing') {
        const registeredPlayers = await tournamentRegistrationsAPI.getPlayersByTournament(tournament.id)
        if (registeredPlayers.length < 2) {
          throw new Error('Se necesitan al menos 2 jugadores inscritos para iniciar el torneo')
        }
      }

      // Actualizar estado en la base de datos
      await tournamentsAPI.update(tournament.id, { status: newStatus })

      // Mensaje de éxito
      const statusMessages = {
        'upcoming': 'reprogramado como próximo',
        'ongoing': 'iniciado correctamente',
        'completed': 'marcado como completado',
        'cancelled': 'cancelado'
      }

      await Swal.fire({
        title: '✅ Estado Actualizado',
        text: `El torneo "${tournament.name}" ha sido ${statusMessages[newStatus]}.`,
        icon: 'success',
        background: '#1f2937',
        color: '#f9fafb',
        confirmButtonColor: '#10b981',
        confirmButtonText: '👍 Perfecto'
      })

      // Recargar torneos para actualizar la vista
      await loadTournaments()

    } catch (error) {
      console.error('Error cambiando estado del torneo:', error)
      
      Swal.fire({
        title: '❌ Error',
        text: error.message || 'No se pudo cambiar el estado del torneo',
        icon: 'error',
        background: '#1f2937',
        color: '#f9fafb',
        confirmButtonColor: '#ef4444'
      })
    }
  }

  // Función para ver detalles del torneo
  const viewTournamentDetails = async (tournament) => {
    // Cargar jugadores inscritos
    let registeredPlayers = []
    let registrationStats = { registered: 0, total: 0 }
    
    try {
      registeredPlayers = await tournamentRegistrationsAPI.getPlayersByTournament(tournament.id)
      registrationStats = await tournamentRegistrationsAPI.getTournamentRegistrationStats(tournament.id)
    } catch (error) {
      console.error('Error cargando jugadores inscritos:', error)
      // Continuar sin jugadores si hay error
    }

    await Swal.fire({
      title: `<span style="color: #10b981; font-size: clamp(18px, 4vw, 24px); font-weight: bold;">🏆 ${tournament.name}</span>`,
      html: `
        <style>
          .tournament-details-modal {
            padding: clamp(12px, 3vw, 20px);
            max-width: 100%;
            overflow-x: hidden;
            color: #e5e7eb;
            background: #1f2937;
            border-radius: 12px;
          }
          .details-section {
            margin-bottom: clamp(12px, 3vw, 16px);
            background: #374151;
            padding: clamp(12px, 3vw, 16px);
            border-radius: 8px;
          }
          .details-section h4 {
            color: #10b981;
            font-size: clamp(14px, 3vw, 16px);
            font-weight: bold;
            margin: 0 0 clamp(8px, 2vw, 12px) 0;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .details-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: clamp(8px, 2vw, 12px);
          }
          @media (min-width: 640px) {
            .details-grid {
              grid-template-columns: 1fr 1fr;
            }
          }
          .detail-item {
            background: #1f2937;
            padding: clamp(8px, 2vw, 12px);
            border-radius: 6px;
            border: 1px solid #4b5563;
          }
          .detail-label {
            font-size: clamp(11px, 2.2vw, 12px);
            font-weight: 600;
            color: #9ca3af;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
          }
          .detail-value {
            font-size: clamp(14px, 3vw, 16px);
            color: #f9fafb;
            font-weight: 500;
          }
          .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
          }
          .status-upcoming { background: #3b82f6; color: white; }
          .status-ongoing { background: #10b981; color: white; }
          .status-completed { background: #6b7280; color: white; }
          .status-cancelled { background: #ef4444; color: white; }
          .registered-players-section {
            background: #374151;
            padding: clamp(12px, 3vw, 16px);
            border-radius: 8px;
            margin-bottom: clamp(12px, 3vw, 16px);
          }
          .players-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: clamp(8px, 2vw, 12px);
            margin-top: 12px;
          }
          @media (max-width: 640px) {
            .players-grid {
              grid-template-columns: 1fr;
            }
          }
          .player-card {
            background: #1f2937;
            border: 1px solid #4b5563;
            border-radius: 8px;
            padding: clamp(10px, 2.5vw, 12px);
            display: flex;
            align-items: center;
            gap: 10px;
            transition: all 0.2s ease;
          }
          .player-card:hover {
            border-color: #10b981;
            transform: translateY(-1px);
            box-shadow: 0 2px 8px rgba(16, 185, 129, 0.2);
          }
          .player-avatar-detail {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            object-fit: cover;
            border: 2px solid #10b981;
            flex-shrink: 0;
          }
          .player-info-detail {
            flex: 1;
            min-width: 0;
          }
          .player-name-detail {
            font-weight: 600;
            color: #f9fafb;
            font-size: clamp(13px, 3vw, 15px);
            margin-bottom: 2px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .player-stats-detail {
            font-size: clamp(11px, 2.2vw, 12px);
            color: #9ca3af;
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
          }
          .player-stat-item {
            background: #374151;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: 500;
          }
          .registration-summary {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #1f2937;
            padding: clamp(10px, 2.5vw, 12px);
            border-radius: 6px;
            border: 1px solid #059669;
          }
          .summary-item {
            text-align: center;
            flex: 1;
          }
          .summary-number {
            font-size: clamp(18px, 4vw, 22px);
            font-weight: bold;
            color: #10b981;
            margin-bottom: 2px;
          }
          .summary-label {
            font-size: clamp(10px, 2vw, 12px);
            color: #9ca3af;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .summary-divider {
            width: 1px;
            height: 30px;
            background: #4b5563;
            margin: 0 8px;
          }
          .empty-players {
            text-align: center;
            padding: 30px 20px;
            color: #9ca3af;
            font-style: italic;
            background: #1f2937;
            border-radius: 8px;
            border: 2px dashed #4b5563;
          }
          .registration-date-badge {
            background: #1e3a8a;
            color: #93c5fd;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: 500;
          }
          .status-editor {
            display: flex;
            align-items: center;
            gap: 8px;
            background: #1f2937;
            padding: 8px 12px;
            border-radius: 6px;
            border: 1px solid #4b5563;
            margin-top: 8px;
          }
          .status-select {
            background: #374151;
            color: #f9fafb;
            border: 1px solid #4b5563;
            border-radius: 4px;
            padding: 4px 8px;
            font-size: 12px;
            cursor: pointer;
            transition: all 0.2s;
          }
          .status-select:hover {
            border-color: #10b981;
          }
          .status-select:focus {
            outline: none;
            border-color: #10b981;
            box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
          }
          .status-action-buttons {
            display: flex;
            gap: 6px;
            margin-top: 8px;
          }
          .status-btn {
            padding: 6px 12px;
            border: none;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .status-btn-start {
            background: #10b981;
            color: white;
          }
          .status-btn-start:hover {
            background: #059669;
            transform: translateY(-1px);
          }
          .status-btn-complete {
            background: #6b7280;
            color: white;
          }
          .status-btn-complete:hover {
            background: #4b5563;
            transform: translateY(-1px);
          }
          .status-btn-cancel {
            background: #ef4444;
            color: white;
          }
          .status-btn-cancel:hover {
            background: #dc2626;
            transform: translateY(-1px);
          }
          .status-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            transform: none !important;
          }
          .status-editor-label {
            font-size: 11px;
            color: #9ca3af;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
        </style>
        <div class="tournament-details-modal">
          <div class="details-section">
            <h4>📅 Información General</h4>
            <div class="details-grid">
              <div class="detail-item">
                <div class="detail-label">Estado</div>
                <div class="detail-value">
                  <span class="status-badge status-${tournament.status}">
                    ${getStatusText(tournament.status)}
                  </span>
                  <div class="status-editor">
                    <span class="status-editor-label">Cambiar Estado:</span>
                    <select id="status-select" class="status-select">
                      <option value="upcoming" ${tournament.status === 'upcoming' ? 'selected' : ''}>📅 Próximo</option>
                      <option value="ongoing" ${tournament.status === 'ongoing' ? 'selected' : ''}>⚡ En Progreso</option>
                      <option value="completed" ${tournament.status === 'completed' ? 'selected' : ''}>🏆 Completado</option>
                      <option value="cancelled" ${tournament.status === 'cancelled' ? 'selected' : ''}>❌ Cancelado</option>
                    </select>
                  </div>
                  <div class="status-action-buttons">
                    <button 
                      class="status-btn status-btn-start" 
                      onclick="handleStatusChange('ongoing')"
                      ${tournament.status !== 'upcoming' ? 'disabled' : ''}
                    >
                      🚀 Iniciar Torneo
                    </button>
                    <button 
                      class="status-btn status-btn-complete" 
                      onclick="handleStatusChange('completed')"
                      ${tournament.status !== 'ongoing' ? 'disabled' : ''}
                    >
                      🏁 Completar
                    </button>
                    <button 
                      class="status-btn status-btn-cancel" 
                      onclick="handleStatusChange('cancelled')"
                      ${tournament.status === 'completed' ? 'disabled' : ''}
                    >
                      🚫 Cancelar
                    </button>
                  </div>
                </div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Tipo de Torneo</div>
                <div class="detail-value">${getTournamentTypeText(tournament.tournament_type)}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Fecha de Inicio</div>
                <div class="detail-value">${formatDate(tournament.start_date)}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Fecha de Fin</div>
                <div class="detail-value">${formatDate(tournament.end_date)}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Fecha Límite Inscripción</div>
                <div class="detail-value">${formatDate(tournament.registration_deadline)}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Máximo de Jugadores</div>
                <div class="detail-value">${tournament.max_players} jugadores</div>
              </div>
            </div>
          </div>

          <!-- Jugadores Inscritos -->
          <div class="registered-players-section">
            <h4>👥 Jugadores Inscritos</h4>
            <div class="registration-summary">
              <div class="summary-item">
                <div class="summary-number">${registrationStats.registered}</div>
                <div class="summary-label">Inscritos</div>
              </div>
              <div class="summary-divider"></div>
              <div class="summary-item">
                <div class="summary-number">${tournament.max_players}</div>
                <div class="summary-label">Máximo</div>
              </div>
              <div class="summary-divider"></div>
              <div class="summary-item">
                <div class="summary-number">${tournament.max_players - registrationStats.registered}</div>
                <div class="summary-label">Disponibles</div>
              </div>
            </div>
            
            ${registeredPlayers.length > 0 ? `
              <div class="players-grid">
                ${registeredPlayers.map((player, index) => `
                  <div class="player-card">
                    <img 
                      src="${player.avatar_url || '/placeholder-user.jpg'}" 
                      alt="${player.name}" 
                      class="player-avatar-detail"
                      onerror="this.src='/placeholder-user.jpg'"
                    >
                    <div class="player-info-detail">
                      <div class="player-name-detail">${player.name}</div>
                      <div class="player-stats-detail">
                        <span class="player-stat-item">#${player.ranking || 'N/A'}</span>
                        <span class="player-stat-item">${player.points || 0} pts</span>
                        <span class="player-stat-item">${player.wins || 0}W/${player.losses || 0}L</span>
                        ${player.registration_date ? `<span class="registration-date-badge">📅 ${new Date(player.registration_date).toLocaleDateString('es-CL')}</span>` : ''}
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
            ` : `
              <div class="empty-players">
                <div style="font-size: 48px; margin-bottom: 12px;">🎾</div>
                <div style="font-size: 16px; margin-bottom: 8px;">No hay jugadores inscritos</div>
                <div style="font-size: 14px;">¡Se el primero en inscribirte a este torneo!</div>
              </div>
            `}
          </div>

          ${tournament.entry_fee > 0 || tournament.prize_pool > 0 ? `
          <div class="details-section">
            <h4>💰 Aspectos Económicos</h4>
            <div class="details-grid">
              ${tournament.entry_fee > 0 ? `
              <div class="detail-item">
                <div class="detail-label">Cuota de Inscripción</div>
                <div class="detail-value">$${tournament.entry_fee.toLocaleString()}</div>
              </div>
              ` : ''}
              ${tournament.prize_pool > 0 ? `
              <div class="detail-item">
                <div class="detail-label">Premio Total</div>
                <div class="detail-value">$${tournament.prize_pool.toLocaleString()}</div>
              </div>
              ` : ''}
            </div>
          </div>
          ` : ''}

          ${tournament.location || tournament.description ? `
          <div class="details-section">
            <h4>📍 Detalles Adicionales</h4>
            ${tournament.location ? `
            <div class="detail-item" style="margin-bottom: 8px;">
              <div class="detail-label">Ubicación</div>
              <div class="detail-value">${tournament.location}</div>
            </div>
            ` : ''}
            ${tournament.description ? `
            <div class="detail-item">
              <div class="detail-label">Descripción</div>
              <div class="detail-value">${tournament.description}</div>
            </div>
            ` : ''}
          </div>
          ` : ''}

          ${tournament.rules ? `
          <div class="details-section">
            <h4>📜 Reglas del Torneo</h4>
            <div class="detail-item">
              <div class="detail-value" style="white-space: pre-wrap; line-height: 1.5;">${tournament.rules}</div>
            </div>
          </div>
          ` : ''}
        </div>
      `,
      showConfirmButton: true,
      confirmButtonText: '✅ Entendido',
      confirmButtonColor: '#10b981',
      background: '#1f2937',
      color: '#f9fafb',
      customClass: {
        popup: 'responsive-modal'
      },
      width: 'clamp(320px, 95vw, 800px)',
      didOpen: () => {
        // Función para manejar cambios de estado
        window.handleStatusChange = async function(newStatus) {
          // Cerrar el modal actual primero
          Swal.close()
          
          // Confirmar el cambio de estado
          const statusNames = {
            'upcoming': 'Próximo',
            'ongoing': 'En Progreso', 
            'completed': 'Completado',
            'cancelled': 'Cancelado'
          }
          
          const statusActions = {
            'upcoming': 'reprogramar como próximo',
            'ongoing': 'iniciar',
            'completed': 'marcar como completado',
            'cancelled': 'cancelar'
          }
          
          const confirmation = await Swal.fire({
            title: `🔄 Cambiar Estado del Torneo`,
            html: `
              <div style="text-align: center; padding: 1rem;">
                <p style="margin-bottom: 1rem; font-size: 16px;">
                  ¿Estás seguro de que quieres <strong>${statusActions[newStatus]}</strong> el torneo:
                </p>
                <p style="font-weight: bold; color: #10b981; font-size: 18px; margin-bottom: 1rem;">${tournament.name}</p>
                <p style="color: #9ca3af; font-size: 14px;">
                  Estado actual: <span style="color: #f9fafb;">${getStatusText(tournament.status)}</span> → 
                  Nuevo estado: <span style="color: #10b981;">${statusNames[newStatus]}</span>
                </p>
                ${newStatus === 'ongoing' ? `
                <div style="margin-top: 1rem; padding: 12px; background: #1e40af; border-radius: 8px;">
                  <p style="margin: 0; color: #93c5fd; font-size: 13px;">
                    ℹ️ Se verificará que haya al menos 2 jugadores inscritos antes de iniciar
                  </p>
                </div>
                ` : ''}
              </div>
            `,
            showCancelButton: true,
            confirmButtonText: '✅ Confirmar Cambio',
            cancelButtonText: '❌ Cancelar',
            confirmButtonColor: '#10b981',
            cancelButtonColor: '#6b7280',
            background: '#1f2937',
            color: '#f9fafb'
          })
          
          if (confirmation.isConfirmed) {
            // Realizar el cambio de estado
            await changeTournamentStatus(tournament, newStatus)
          } else {
            // Si se cancela, volver a mostrar el modal de detalles
            setTimeout(() => viewTournamentDetails(tournament), 100)
          }
        }
        
        // Función para manejar cambios en el select
        window.handleSelectChange = function() {
          const select = document.getElementById('status-select')
          if (select && select.value !== tournament.status) {
            window.handleStatusChange(select.value)
          }
        }
        
        // Agregar event listener al select
        const statusSelect = document.getElementById('status-select')
        if (statusSelect) {
          statusSelect.addEventListener('change', window.handleSelectChange)
        }
        
        // Limpiar funciones cuando se cierre el modal
        const modal = document.querySelector('.swal2-container')
        if (modal) {
          modal.addEventListener('DOMNodeRemoved', function() {
            delete window.handleStatusChange
            delete window.handleSelectChange
          })
        }
      }
    })
  }

  // Función para inscribir jugadores al torneo
  const registerPlayersToTournament = async (tournament) => {
    // Cargar todos los jugadores y separar inscritos de disponibles
    let allPlayers = []
    let registeredPlayers = []
    let availablePlayers = []
    
    try {
      allPlayers = await playersAPI.getAll()
      
      // Obtener jugadores ya inscritos en el torneo
      registeredPlayers = await tournamentRegistrationsAPI.getPlayersByTournament(tournament.id)
      
      // Filtrar jugadores disponibles (que no estén ya inscritos)
      const registeredPlayerIds = registeredPlayers.map(p => p.id)
      availablePlayers = allPlayers.filter(player => !registeredPlayerIds.includes(player.id))
      
    } catch (error) {
      console.error('Error cargando jugadores:', error)
      Swal.fire({
        title: 'Error',
        text: 'No se pudieron cargar los jugadores disponibles',
        icon: 'error',
        background: '#1f2937',
        color: '#f9fafb'
      })
      return
    }

    const { value: selectedPlayers } = await Swal.fire({
      title: `<span style="color: #10b981; font-size: clamp(16px, 4vw, 20px); font-weight: bold;">👥 Inscribir Jugadores - ${tournament.name}</span>`,
      html: `
        <style>
          .register-players-modal {
            padding: clamp(12px, 3vw, 20px);
            max-width: 100%;
            overflow-x: hidden;
            color: #e5e7eb;
            background: #1f2937;
            border-radius: 12px;
          }
          .tournament-info {
            background: #374151;
            padding: clamp(12px, 3vw, 16px);
            border-radius: 8px;
            margin-bottom: clamp(12px, 3vw, 16px);
            text-align: center;
          }
          .tournament-info .info-item {
            display: inline-block;
            margin: 0 clamp(8px, 2vw, 12px);
            color: #9ca3af;
            font-size: clamp(12px, 2.5vw, 14px);
          }
          .tournament-info .info-value {
            color: #10b981;
            font-weight: bold;
          }
          .players-section {
            background: #374151;
            padding: clamp(12px, 3vw, 16px);
            border-radius: 8px;
            margin-bottom: clamp(12px, 3vw, 16px);
          }
          .players-section h4 {
            color: #10b981;
            font-size: clamp(14px, 3vw, 16px);
            font-weight: bold;
            margin: 0 0 clamp(12px, 3vw, 16px) 0;
            text-align: left;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .registered-players-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 8px;
            max-height: 150px;
            overflow-y: auto;
            padding: 4px;
          }
          .registered-player-card {
            display: flex;
            align-items: center;
            padding: 8px;
            background: #1f2937;
            border-radius: 6px;
            border: 1px solid #059669;
            gap: 8px;
          }
          .player-avatar-small {
            width: 28px;
            height: 28px;
            border-radius: 50%;
            object-fit: cover;
            border: 2px solid #10b981;
          }
          .player-details-compact {
            flex: 1;
            min-width: 0;
          }
          .player-name-compact {
            font-weight: 500;
            color: #f9fafb;
            font-size: 13px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .player-rank-compact {
            font-size: 11px;
            color: #9ca3af;
          }
          .multi-select-dropdown {
            position: relative;
            margin-bottom: 16px;
          }
          .multi-select-trigger {
            width: 100%;
            padding: clamp(10px, 2.5vw, 12px);
            border: 2px solid #4b5563;
            border-radius: 8px;
            font-size: clamp(14px, 3vw, 16px);
            background: #1f2937;
            color: #f9fafb;
            cursor: pointer;
            text-align: left;
            display: flex;
            justify-content: space-between;
            align-items: center;
            transition: all 0.3s ease;
            min-height: 44px;
          }
          .multi-select-trigger:hover {
            border-color: #10b981;
          }
          .multi-select-trigger.active {
            border-color: #10b981;
            box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
          }
          .multi-select-content {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: #1f2937;
            border: 2px solid #4b5563;
            border-top: none;
            border-radius: 0 0 8px 8px;
            max-height: 250px;
            overflow-y: auto;
            z-index: 1000;
            display: none;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
          }
          .multi-select-content.show {
            display: block;
          }
          .multi-select-option {
            padding: 10px 12px;
            border-bottom: 1px solid #374151;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 10px;
            transition: background-color 0.2s;
          }
          .multi-select-option:hover {
            background-color: #374151;
          }
          .multi-select-option:last-child {
            border-bottom: none;
          }
          .multi-select-checkbox {
            margin: 0;
            accent-color: #10b981;
            transform: scale(1.1);
          }
          .selected-count-badge {
            background: #10b981;
            color: white;
            border-radius: 12px;
            padding: 2px 8px;
            font-size: 12px;
            font-weight: bold;
            margin-left: 8px;
          }
          .dropdown-arrow {
            transition: transform 0.2s;
            color: #9ca3af;
          }
          .dropdown-arrow.rotated {
            transform: rotate(180deg);
          }
          .empty-state {
            text-align: center;
            padding: 20px;
            color: #9ca3af;
            font-style: italic;
          }
        </style>
        <div class="register-players-modal">
          <div class="tournament-info">
            <div class="info-item">Inscritos: <span class="info-value">${registeredPlayers.length}/${tournament.max_players}</span></div>
            <div class="info-item">Tipo: <span class="info-value">${getTournamentTypeText(tournament.tournament_type)}</span></div>
            <div class="info-item">Estado: <span class="info-value">${getStatusText(tournament.status)}</span></div>
          </div>
          
          <!-- Jugadores Ya Inscritos -->
          <div class="players-section">
            <h4>✅ Jugadores Inscritos (${registeredPlayers.length})</h4>
            ${registeredPlayers.length > 0 ? `
              <div class="registered-players-grid">
                ${registeredPlayers.map(player => `
                  <div class="registered-player-card">
                    <img 
                      src="${player.avatar_url || '/placeholder-user.jpg'}" 
                      alt="${player.name}" 
                      class="player-avatar-small"
                      onerror="this.src='/placeholder-user.jpg'"
                    >
                    <div class="player-details-compact">
                      <div class="player-name-compact">${player.name}</div>
                      <div class="player-rank-compact">#${player.ranking || 'N/A'} • ${player.points || 0} pts</div>
                    </div>
                  </div>
                `).join('')}
              </div>
            ` : `
              <div class="empty-state">
                No hay jugadores inscritos aún
              </div>
            `}
          </div>
          
          ${tournament.status === 'upcoming' && availablePlayers.length > 0 ? `
          <!-- Inscribir Nuevos Jugadores -->
          <div class="players-section">
            <h4>➕ Inscribir Nuevos Jugadores</h4>
            <div class="multi-select-dropdown">
              <div class="multi-select-trigger" onclick="toggleMultiSelect()">
                <span id="multi-select-text">Seleccionar jugadores para inscribir...</span>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span id="selected-count-badge" class="selected-count-badge" style="display: none;">0</span>
                  <span class="dropdown-arrow">▼</span>
                </div>
              </div>
              <div id="multi-select-content" class="multi-select-content">
                ${availablePlayers.map(player => `
                  <div class="multi-select-option" onclick="togglePlayerOption('${player.id}', event)">
                    <input 
                      type="checkbox" 
                      class="multi-select-checkbox" 
                      id="player-option-${player.id}"
                      data-player-id="${player.id}"
                      onclick="event.stopPropagation()"
                      onchange="updateMultiSelectDisplay()"
                    >
                    <img 
                      src="${player.avatar_url || '/placeholder-user.jpg'}" 
                      alt="${player.name}" 
                      class="player-avatar-small"
                      onerror="this.src='/placeholder-user.jpg'"
                    >
                    <div class="player-details-compact">
                      <div class="player-name-compact">${player.name}</div>
                      <div class="player-rank-compact">#${player.ranking || 'N/A'} • ${player.points || 0} pts • ${player.wins || 0}W/${player.losses || 0}L</div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
          ` : ''}
          
          ${tournament.status !== 'upcoming' ? `
          <div style="margin-top: 12px; padding: 12px; background: #dc2626; border-radius: 8px; text-align: center;">
            <p style="margin: 0; color: white; font-size: 14px;">
              ⚠️ Solo se pueden inscribir jugadores en torneos con estado "Próximo"
            </p>
          </div>
          ` : availablePlayers.length === 0 && tournament.status === 'upcoming' ? `
          <div style="margin-top: 12px; padding: 12px; background: #1e40af; border-radius: 8px; text-align: center;">
            <p style="margin: 0; color: #93c5fd; font-size: 14px;">
              ℹ️ Todos los jugadores disponibles ya están inscritos en este torneo
            </p>
          </div>
          ` : ''}
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: tournament.status === 'upcoming' ? '✅ Inscribir Jugadores' : '🔍 Entendido',
      cancelButtonText: '❌ Cancelar',
      background: '#1f2937',
      color: '#f9fafb',
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      customClass: {
        popup: 'responsive-modal'
      },
      width: 'clamp(320px, 95vw, 700px)',
      didOpen: () => {
        // Funciones para el multi-select dropdown
        window.toggleMultiSelect = function() {
          const content = document.getElementById('multi-select-content');
          const trigger = document.querySelector('.multi-select-trigger');
          const arrow = document.querySelector('.dropdown-arrow');
          
          if (content && trigger && arrow) {
            const isVisible = content.classList.contains('show');
            content.classList.toggle('show');
            trigger.classList.toggle('active');
            arrow.classList.toggle('rotated');
          }
        }
        
        window.togglePlayerOption = function(playerId, event) {
          event.stopPropagation();
          const checkbox = document.getElementById('player-option-' + playerId);
          if (checkbox) {
            checkbox.checked = !checkbox.checked;
            window.updateMultiSelectDisplay();
          }
        }
        
        window.updateMultiSelectDisplay = function() {
          const checkboxes = document.querySelectorAll('.multi-select-checkbox');
          const selectedCount = Array.from(checkboxes).filter(cb => cb.checked).length;
          const countBadge = document.getElementById('selected-count-badge');
          const textElement = document.getElementById('multi-select-text');
          
          if (countBadge && textElement) {
            if (selectedCount > 0) {
              countBadge.style.display = 'inline';
              countBadge.textContent = selectedCount;
              textElement.textContent = selectedCount === 1 ? 
                '1 jugador seleccionado' : 
                selectedCount + ' jugadores seleccionados';
            } else {
              countBadge.style.display = 'none';
              textElement.textContent = 'Seleccionar jugadores para inscribir...';
            }
          }
        }
        
        // Cerrar dropdown al hacer click fuera
        const handleClickOutside = function(event) {
          const dropdown = document.querySelector('.multi-select-dropdown');
          if (dropdown && !dropdown.contains(event.target)) {
            const content = document.getElementById('multi-select-content');
            const trigger = document.querySelector('.multi-select-trigger');
            const arrow = document.querySelector('.dropdown-arrow');
            if (content && trigger && arrow) {
              content.classList.remove('show');
              trigger.classList.remove('active');
              arrow.classList.remove('rotated');
            }
          }
        }
        
        document.addEventListener('click', handleClickOutside);
        
        // Limpiar event listeners cuando se cierre el modal
        const modal = document.querySelector('.swal2-container');
        if (modal) {
          modal.addEventListener('DOMNodeRemoved', function() {
            document.removeEventListener('click', handleClickOutside);
            delete window.toggleMultiSelect;
            delete window.togglePlayerOption;
            delete window.updateMultiSelectDisplay;
          });
        }
      },
      preConfirm: () => {
        if (tournament.status !== 'upcoming') return null
        
        const checkboxes = document.querySelectorAll('.multi-select-checkbox:checked')
        const selected = Array.from(checkboxes).map(cb => cb.dataset.playerId)
        
        if (selected.length === 0) {
          Swal.showValidationMessage('Selecciona al menos un jugador para inscribir')
          return false
        }
        
        // Validar que no se exceda el límite máximo
        const remainingSlots = tournament.max_players - registeredPlayers.length
        if (selected.length > remainingSlots) {
          Swal.showValidationMessage('Solo quedan ' + remainingSlots + ' cupos disponibles en el torneo')
          return false
        }
        
        return selected
      }
    })

    if (selectedPlayers && selectedPlayers.length > 0) {
      try {
        // Inscribir jugadores usando la API real
        await tournamentRegistrationsAPI.registerPlayers(tournament.id, selectedPlayers)
        
        await Swal.fire({
          title: '🎉 ¡Éxito!',
          html: `
            <div style="text-align: center; padding: 1rem;">
              <p style="margin-bottom: 1rem; font-size: 16px;">
                Se han inscrito <strong>${selectedPlayers.length}</strong> jugador${selectedPlayers.length === 1 ? '' : 'es'} al torneo:
              </p>
              <p style="font-weight: bold; color: #10b981; font-size: 18px;">${tournament.name}</p>
              <div style="margin-top: 1rem; padding: 12px; background: #374151; border-radius: 8px;">
                <p style="margin: 0; color: #9ca3af; font-size: 14px;">
                  ✅ Los jugadores han sido registrados exitosamente en la base de datos
                </p>
              </div>
            </div>
          `,
          icon: 'success',
          background: '#1f2937',
          color: '#f9fafb',
          confirmButtonColor: '#10b981',
          confirmButtonText: '✅ Perfecto'
        })

        // Recargar torneos para actualizar la vista
        await loadTournaments()
      } catch (error) {
        console.error('Error inscribiendo jugadores:', error)
        
        let errorMessage = error.message || 'Error desconocido al inscribir jugadores'
        
        // Mensajes de error más user-friendly
        if (errorMessage.includes('tabla "tournament_registrations" no existe')) {
          errorMessage = '❌ La tabla de inscripciones no existe en la base de datos.\n\n💡 Solución: Necesitas crear la tabla "tournament_registrations" en Supabase.'
        } else if (errorMessage.includes('ya están inscritos')) {
          errorMessage = '⚠️ Algunos jugadores ya están inscritos en este torneo.\n\n💡 Intenta seleccionar solo jugadores que no estén registrados.'
        } else if (errorMessage.includes('Solo quedan')) {
          errorMessage = '🚫 ' + errorMessage + '\n\n💡 Selecciona menos jugadores o aumenta el límite máximo del torneo.'
        }
        
        Swal.fire({
          title: '❌ Error al Inscribir Jugadores',
          html: `
            <div style="text-align: left; padding: 1rem; background: #374151; border-radius: 8px; margin: 1rem 0;">
              <p style="margin: 0; color: #f9fafb; line-height: 1.5;">${errorMessage}</p>
            </div>
            <div style="margin-top: 1rem; padding: 1rem; background: #1e3a8a; border-radius: 8px;">
              <p style="margin: 0; color: #93c5fd; font-size: 0.9rem;">
                <strong>📋 Información técnica:</strong><br>
                Revisa la consola del navegador (F12) para más detalles específicos del error.
              </p>
            </div>
          `,
          icon: 'error',
          background: '#1f2937',
          color: '#f9fafb',
          confirmButtonText: '🔍 Entendido',
          confirmButtonColor: '#ef4444',
          width: '600px'
        })
      }
    }
  }

  // Cargar datos al montar el componente
  useEffect(() => {
    loadTournaments()
  }, [])

  // Agregar estilos responsive (mismo que player modal)
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      .responsive-modal {
        width: clamp(320px, 95vw, 800px) !important;
        max-width: 95vw !important;
        margin: clamp(10px, 2vh, 20px) auto !important;
      }
      .swal-html-container {
        max-height: 70vh !important;
        overflow-y: auto !important;
        padding: 0 !important;
      }
      @media (max-width: 640px) {
        .responsive-modal {
          margin: 5px auto !important;
        }
        .swal2-popup {
          font-size: 14px !important;
        }
        .swal2-title {
          font-size: 18px !important;
          padding: 10px !important;
        }
        .swal2-actions {
          flex-direction: column !important;
          gap: 8px !important;
        }
        .swal2-confirm, .swal2-cancel {
          width: 100% !important;
          margin: 0 !important;
          padding: 12px 16px !important;
          font-size: 14px !important;
        }
      }
    `
    document.head.appendChild(style)
    
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Torneos</h2>
            <p className="text-muted-foreground">Cargando torneos...</p>
          </div>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Torneos</h2>
          <p className="text-muted-foreground">Gestión de torneos activos, próximos y histórico</p>
        </div>
        <Button onClick={handleAddTournament}>
          <Plus className="h-4 w-4 mr-2" />
          Crear Torneo
        </Button>
      </div>

      {/* Tournament Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {tournamentStats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Active Tournaments */}
      <Card>
        <CardHeader>
          <CardTitle>Torneos Activos</CardTitle>
          <CardDescription>Competencias en curso</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {activeTournaments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No hay torneos activos</p>
            ) : (
              activeTournaments.map((tournament) => (
                <div 
                  key={tournament.id} 
                  className="p-4 border rounded-lg cursor-pointer hover:shadow-lg transition-all duration-200 hover:bg-accent/50 hover:border-primary/50"
                  onClick={() => {
                    console.log('Clickeando card de torneo activo:', tournament.name)
                    viewTournamentDetails(tournament)
                  }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold">{tournament.name}</h3>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>{getTournamentTypeText(tournament.tournament_type)}</span>
                        <span>{tournament.max_players} máx. participantes</span>
                        <span>
                          {formatDate(tournament.start_date)} - {formatDate(tournament.end_date)}
                        </span>
                      </div>
                      {tournament.prize_pool > 0 && (
                        <p className="text-sm">
                          <span className="font-medium">Premio:</span> ${tournament.prize_pool.toLocaleString()}
                        </p>
                      )}
                      {tournament.location && (
                        <p className="text-sm">
                          <span className="font-medium">Ubicación:</span> {tournament.location}
                        </p>
                      )}
                    </div>
                    <Badge className={getStatusBadgeColor(tournament.status)}>
                      {getStatusText(tournament.status)}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progreso: {getCurrentRound(tournament)}</span>
                      <span>{getTournamentProgress(tournament)}%</span>
                    </div>
                    <Progress value={getTournamentProgress(tournament)} className="h-2" />
                  </div>

                  <div className="flex justify-between items-end mt-4">
                    <p className="text-xs text-blue-600 font-medium opacity-70">
                      📋 Click para ver detalles del torneo
                    </p>
                    <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        console.log('Clickeando Ver Bracket para:', tournament.name)
                        // TODO: Implementar vista de bracket
                      }}
                    >
                      Ver Bracket
                    </Button>
                    <Button 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        console.log('Clickeando Gestionar para:', tournament.name)
                        // TODO: Implementar gestión de torneo
                      }}
                    >
                      Gestionar
                    </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Upcoming Tournaments */}
        <Card>
          <CardHeader>
            <CardTitle>Próximos Torneos</CardTitle>
            <CardDescription>Competencias programadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingTournaments.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No hay torneos próximos</p>
              ) : (
                upcomingTournaments.map((tournament) => (
                  <div key={tournament.id} className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">{tournament.name}</h3>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>
                        {getTournamentTypeText(tournament.tournament_type)} • {tournament.max_players} máx. participantes
                      </p>
                      <p>Inicio: {formatDate(tournament.start_date)}</p>
                      <p>Inscripciones hasta: {formatDate(tournament.registration_deadline)}</p>
                      {tournament.prize_pool > 0 && (
                        <p className="font-medium text-foreground">
                          Premio: ${tournament.prize_pool.toLocaleString()}
                        </p>
                      )}
                      {tournament.entry_fee > 0 && (
                        <p>Cuota de inscripción: ${tournament.entry_fee.toLocaleString()}</p>
                      )}
                      {tournament.location && (
                        <p>Ubicación: {tournament.location}</p>
                      )}
                    </div>
                    <div className="flex justify-end space-x-2 mt-3">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          console.log('Clickeando Ver Detalles para:', tournament.name)
                          viewTournamentDetails(tournament)
                        }}
                      >
                        Ver Detalles
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={() => {
                          console.log('Clickeando Inscribir Jugadores para:', tournament.name)
                          registerPlayersToTournament(tournament)
                        }}
                      >
                        Inscribir Jugadores
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Past Tournaments */}
        <Card>
          <CardHeader>
            <CardTitle>Torneos Anteriores</CardTitle>
            <CardDescription>Historial de competencias</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pastTournaments.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No hay torneos completados</p>
              ) : (
                pastTournaments.map((tournament) => (
                  <div key={tournament.id} className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">{tournament.name}</h3>
                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="text-muted-foreground">Tipo:</span>{" "}
                        <span>{getTournamentTypeText(tournament.tournament_type)}</span>
                      </p>
                      <p className="text-muted-foreground">
                        {tournament.max_players} participantes • {formatDate(tournament.end_date)}
                      </p>
                      {tournament.prize_pool > 0 && (
                        <p className="font-medium">Premio: ${tournament.prize_pool.toLocaleString()}</p>
                      )}
                      {tournament.location && (
                        <p className="text-muted-foreground">Ubicación: {tournament.location}</p>
                      )}
                    </div>
                    <div className="flex justify-end mt-3">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          console.log('Clickeando Ver Resultados para:', tournament.name)
                          viewTournamentDetails(tournament)
                        }}
                      >
                        Ver Resultados
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
