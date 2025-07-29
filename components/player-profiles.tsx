"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Search, Plus, Trophy, Phone, Mail, User, Calendar, Target, Zap } from "lucide-react"
import { useState, useEffect } from "react"
import Swal from "sweetalert2"
import { playersAPI } from "@/lib/supabase"

export function PlayerProfiles() {
  const [searchTerm, setSearchTerm] = useState("")
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Cargar jugadores desde Supabase
  useEffect(() => {
    loadPlayers()
  }, [])

  const loadPlayers = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await playersAPI.getAll()
      
      // Transformar datos de Supabase al formato del componente
      const transformedPlayers = data.map(player => ({
        id: player.id,
        name: player.name,
        email: player.email,
        phone: player.phone,
        ranking: player.ranking,
        points: player.points,
        matches: player.matches_played,
        wins: player.wins,
        losses: player.losses,
        winRate: player.win_rate,
        joinDate: player.join_date,
        lastMatch: player.last_match,
        favoriteShot: player.favorite_shot,
        playingStyle: player.playing_style,
        achievements: player.achievements || []
      }))
      
      setPlayers(transformedPlayers)
    } catch (err) {
      setError(err.message)
      console.error('Error cargando jugadores:', err)
    } finally {
      setLoading(false)
    }
  }


  const viewProfile = async (player: typeof players[0]) => {
    await Swal.fire({
      title: `Perfil de ${player.name}`,
      html: `
        <style>
          @media (max-width: 768px) {
            .desktop-header { display: none !important; }
            .mobile-header { display: block !important; }
            .desktop-stats { display: none !important; }
            .mobile-stats { display: grid !important; }
            .player-profile-modal { padding: 12px !important; }
          }
          @media (min-width: 769px) {
            .desktop-header { display: flex !important; }
            .mobile-header { display: none !important; }
            .desktop-stats { display: grid !important; }
            .mobile-stats { display: none !important; }
          }
        </style>
        <div class="player-profile-modal" style="text-align: left; color: #e5e7eb; background: #1f2937; padding: 16px; border-radius: 12px;">
          <!-- Desktop Layout -->
          <div class="desktop-header" style="display: flex; align-items: flex-start; gap: 32px; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 1px solid #374151;">
            <img src="/logo.png" alt="${player.name}" style="width: 300px; height: 300px; border-radius: 16px; object-fit: cover; border: 4px solid #10b981; flex-shrink: 0;">
            <div style="flex: 1; padding-top: 20px;">
              <h3 style="margin: 0 0 16px 0; font-size: 32px; font-weight: bold; color: #f9fafb;">${player.name}</h3>
              <div style="display: flex; align-items: center; gap: 16px; margin: 16px 0; flex-wrap: wrap;">
                <span style="background: #10b981; color: white; padding: 8px 16px; border-radius: 8px; font-size: 16px; font-weight: bold;">#${player.ranking}</span>
                <span style="color: #9ca3af; font-size: 18px;">${player.points} puntos</span>
              </div>
              <p style="margin: 16px 0 0 0; color: #9ca3af; font-size: 16px;"><strong>Miembro desde:</strong> ${new Date(player.joinDate).toLocaleDateString('es-ES')}</p>
              <p style="margin: 8px 0 0 0; color: #9ca3af; font-size: 16px;"><strong>Último partido:</strong> ${player.lastMatch}</p>
              
              <div style="margin-top: 24px; display: flex; gap: 16px; flex-wrap: wrap;">
                <div style="background: #374151; padding: 12px 16px; border-radius: 8px; flex: 1; min-width: 140px;">
                  <p style="margin: 0; color: #9ca3af; font-size: 12px; font-weight: bold;">ESTILO DE JUEGO</p>
                  <p style="margin: 4px 0 0 0; color: #f9fafb; font-size: 16px; font-weight: bold;">${player.playingStyle}</p>
                </div>
                <div style="background: #374151; padding: 12px 16px; border-radius: 8px; flex: 1; min-width: 140px;">
                  <p style="margin: 0; color: #9ca3af; font-size: 12px; font-weight: bold;">GOLPE FAVORITO</p>
                  <p style="margin: 4px 0 0 0; color: #f9fafb; font-size: 16px; font-weight: bold;">${player.favoriteShot}</p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Mobile Layout -->
          <div class="mobile-header" style="display: none; text-align: center; margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1px solid #374151;">
            <img src="/logo.png" alt="${player.name}" style="width: 200px; height: 200px; border-radius: 16px; object-fit: cover; border: 3px solid #10b981; margin: 0 auto 16px auto; display: block;">
            <h3 style="margin: 0 0 12px 0; font-size: 24px; font-weight: bold; color: #f9fafb;">${player.name}</h3>
            <div style="display: flex; align-items: center; justify-content: center; gap: 12px; margin: 12px 0; flex-wrap: wrap;">
              <span style="background: #10b981; color: white; padding: 6px 12px; border-radius: 8px; font-size: 14px; font-weight: bold;">#${player.ranking}</span>
              <span style="color: #9ca3af; font-size: 16px;">${player.points} puntos</span>
            </div>
            <p style="margin: 12px 0 0 0; color: #9ca3af; font-size: 14px;"><strong>Miembro desde:</strong> ${new Date(player.joinDate).toLocaleDateString('es-ES')}</p>
            <p style="margin: 6px 0 0 0; color: #9ca3af; font-size: 14px;"><strong>Último partido:</strong> ${player.lastMatch}</p>
            
            <div style="margin-top: 16px; display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div style="background: #374151; padding: 10px 12px; border-radius: 8px;">
                <p style="margin: 0; color: #9ca3af; font-size: 11px; font-weight: bold;">ESTILO DE JUEGO</p>
                <p style="margin: 4px 0 0 0; color: #f9fafb; font-size: 14px; font-weight: bold;">${player.playingStyle}</p>
              </div>
              <div style="background: #374151; padding: 10px 12px; border-radius: 8px;">
                <p style="margin: 0; color: #9ca3af; font-size: 11px; font-weight: bold;">GOLPE FAVORITO</p>
                <p style="margin: 4px 0 0 0; color: #f9fafb; font-size: 14px; font-weight: bold;">${player.favoriteShot}</p>
              </div>
            </div>
          </div>
          
          <div style="margin-bottom: 24px;">
            <h4 style="color: #10b981; margin: 0 0 12px 0; font-size: 18px; font-weight: bold;">📧 Información de Contacto</h4>
            <div style="background: #374151; padding: 20px; border-radius: 8px;">
              <p style="margin: 0 0 12px 0; font-size: 16px; word-break: break-word;"><strong>Email:</strong> ${player.email}</p>
              <p style="margin: 0; font-size: 16px;"><strong>Teléfono:</strong> ${player.phone}</p>
            </div>
          </div>
          
          <div style="margin-bottom: 24px;">
            <h4 style="color: #10b981; margin: 0 0 12px 0; font-size: 18px; font-weight: bold;">📊 Estadísticas</h4>
            <div style="background: #374151; padding: 20px; border-radius: 8px;">
              <!-- Desktop Stats Grid -->
              <div class="desktop-stats" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; text-align: center;">
                <div style="background: #1f2937; padding: 18px; border-radius: 8px;">
                  <div style="font-size: 28px; font-weight: bold; color: #10b981;">${player.wins}</div>
                  <div style="font-size: 14px; color: #9ca3af; margin-top: 4px;">Victorias</div>
                </div>
                <div style="background: #1f2937; padding: 18px; border-radius: 8px;">
                  <div style="font-size: 28px; font-weight: bold; color: #ef4444;">${player.losses}</div>
                  <div style="font-size: 14px; color: #9ca3af; margin-top: 4px;">Derrotas</div>
                </div>
                <div style="background: #1f2937; padding: 18px; border-radius: 8px;">
                  <div style="font-size: 28px; font-weight: bold; color: #f59e0b;">${player.winRate.toFixed(1)}%</div>
                  <div style="font-size: 14px; color: #9ca3af; margin-top: 4px;">% Victoria</div>
                </div>
                <div style="background: #1f2937; padding: 18px; border-radius: 8px;">
                  <div style="font-size: 28px; font-weight: bold; color: #3b82f6;">${player.matches}</div>
                  <div style="font-size: 14px; color: #9ca3af; margin-top: 4px;">Partidos</div>
                </div>
              </div>
              
              <!-- Mobile Stats Grid -->
              <div class="mobile-stats" style="display: none; grid-template-columns: repeat(2, 1fr); gap: 12px; text-align: center;">
                <div style="background: #1f2937; padding: 14px; border-radius: 8px;">
                  <div style="font-size: 22px; font-weight: bold; color: #10b981;">${player.wins}</div>
                  <div style="font-size: 12px; color: #9ca3af; margin-top: 4px;">Victorias</div>
                </div>
                <div style="background: #1f2937; padding: 14px; border-radius: 8px;">
                  <div style="font-size: 22px; font-weight: bold; color: #ef4444;">${player.losses}</div>
                  <div style="font-size: 12px; color: #9ca3af; margin-top: 4px;">Derrotas</div>
                </div>
                <div style="background: #1f2937; padding: 14px; border-radius: 8px;">
                  <div style="font-size: 22px; font-weight: bold; color: #f59e0b;">${player.winRate.toFixed(1)}%</div>
                  <div style="font-size: 12px; color: #9ca3af; margin-top: 4px;">% Victoria</div>
                </div>
                <div style="background: #1f2937; padding: 14px; border-radius: 8px;">
                  <div style="font-size: 22px; font-weight: bold; color: #3b82f6;">${player.matches}</div>
                  <div style="font-size: 12px; color: #9ca3af; margin-top: 4px;">Partidos</div>
                </div>
              </div>
            </div>
          </div>
          
          ${player.achievements.length > 0 ? `
          <div>
            <h4 style="color: #10b981; margin: 0 0 12px 0; font-size: 18px; font-weight: bold;">🏆 Logros y Reconocimientos</h4>
            <div style="background: #374151; padding: 20px; border-radius: 8px;">
              <div style="display: flex; flex-wrap: wrap; gap: 12px;">
                ${player.achievements.map(achievement => `
                  <span style="background: #065f46; color: #10b981; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: bold;">
                    ${achievement}
                  </span>
                `).join('')}
              </div>
            </div>
          </div>
          ` : ''}
        </div>
      `,
      confirmButtonText: 'Cerrar',
      confirmButtonColor: '#10b981',
      width: window.innerWidth <= 768 ? '95%' : '800px',
      background: '#1f2937',
      color: '#e5e7eb',
      customClass: {
        popup: 'dark-modal',
        title: 'dark-modal-title',
        htmlContainer: 'dark-modal-content'
      }
    })
  }

  const deletePlayer = async (player: typeof players[0]) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar a ${player.name}? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    })

    if (result.isConfirmed) {
      try {
        await playersAPI.delete(player.id)
        await loadPlayers() // Recargar la lista
        Swal.fire({
          title: '¡Eliminado!',
          text: `${player.name} ha sido eliminado correctamente.`,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        })
      } catch (error) {
        Swal.fire({
          title: 'Error',
          text: error.message || 'No se pudo eliminar el jugador',
          icon: 'error'
        })
      }
    }
  }

  const editPlayer = async (player: typeof players[0]) => {
    const { value: formValues } = await Swal.fire({
      title: `Editar Perfil de ${player.name}`,
      html: `
        <div class="player-edit-modal" style="text-align: left; color: #e5e7eb; background: #1f2937; padding: 20px; border-radius: 12px;">
          <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1px solid #374151;">
            <img src="/logo.png" alt="${player.name}" style="width: 150px; height: 150px; border-radius: 12px; object-fit: cover; border: 3px solid #10b981;">
            <div style="flex: 1;">
              <label style="color: #10b981; font-size: 14px; font-weight: bold; display: block; margin-bottom: 4px;">Nombre Completo *</label>
              <input id="edit-name" value="${player.name}" style="width: 100%; padding: 8px 12px; background: #374151; border: 1px solid #4b5563; border-radius: 6px; color: #f9fafb; font-size: 16px; margin-bottom: 8px;">
              <div style="display: flex; align-items: center; gap: 10px; margin: 8px 0;">
                <span style="background: #10b981; color: white; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: bold;">#${player.ranking}</span>
                <span style="color: #9ca3af;">${player.points} puntos</span>
              </div>
            </div>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px;">
            <div>
              <h4 style="color: #10b981; margin: 0 0 12px 0; font-size: 16px; font-weight: bold;">📧 Información de Contacto</h4>
              <div style="background: #374151; padding: 16px; border-radius: 8px; space-y: 12px;">
                <div style="margin-bottom: 12px;">
                  <label style="color: #9ca3af; font-size: 12px; font-weight: bold; display: block; margin-bottom: 4px;">EMAIL</label>
                  <input id="edit-email" value="${player.email}" type="email" style="width: 100%; padding: 8px 12px; background: #1f2937; border: 1px solid #4b5563; border-radius: 6px; color: #f9fafb;">
                </div>
                <div>
                  <label style="color: #9ca3af; font-size: 12px; font-weight: bold; display: block; margin-bottom: 4px;">TELÉFONO</label>
                  <input id="edit-phone" value="${player.phone}" style="width: 100%; padding: 8px 12px; background: #1f2937; border: 1px solid #4b5563; border-radius: 6px; color: #f9fafb;">
                </div>
              </div>
            </div>
            
            <div>
              <h4 style="color: #10b981; margin: 0 0 12px 0; font-size: 16px; font-weight: bold;">🎾 Estilo de Juego</h4>
              <div style="background: #374151; padding: 16px; border-radius: 8px;">
                <div style="margin-bottom: 12px;">
                  <label style="color: #9ca3af; font-size: 12px; font-weight: bold; display: block; margin-bottom: 4px;">ESTILO</label>
                  <select id="edit-style" style="width: 100%; padding: 8px 12px; background: #1f2937; border: 1px solid #4b5563; border-radius: 6px; color: #f9fafb;">
                    <option value="Agresivo" ${player.playingStyle === 'Agresivo' ? 'selected' : ''}>Agresivo</option>
                    <option value="Defensivo" ${player.playingStyle === 'Defensivo' ? 'selected' : ''}>Defensivo</option>
                    <option value="Completo" ${player.playingStyle === 'Completo' ? 'selected' : ''}>Completo</option>
                    <option value="Red" ${player.playingStyle === 'Red' ? 'selected' : ''}>Red</option>
                    <option value="Consistente" ${player.playingStyle === 'Consistente' ? 'selected' : ''}>Consistente</option>
                    <option value="Táctico" ${player.playingStyle === 'Táctico' ? 'selected' : ''}>Táctico</option>
                    <option value="POING" ${player.playingStyle === 'POING' ? 'selected' : ''}>POING</option>
                  </select>
                </div>
                <div>
                  <label style="color: #9ca3af; font-size: 12px; font-weight: bold; display: block; margin-bottom: 4px;">GOLPE FAVORITO</label>
                  <select id="edit-shot" style="width: 100%; padding: 8px 12px; background: #1f2937; border: 1px solid #4b5563; border-radius: 6px; color: #f9fafb;">
                    <option value="Derecha" ${player.favoriteShot === 'Derecha' ? 'selected' : ''}>Derecha</option>
                    <option value="Revés" ${player.favoriteShot === 'Revés' ? 'selected' : ''}>Revés</option>
                    <option value="Saque" ${player.favoriteShot === 'Saque' ? 'selected' : ''}>Saque</option>
                    <option value="Volea" ${player.favoriteShot === 'Volea' ? 'selected' : ''}>Volea</option>
                    <option value="Smash" ${player.favoriteShot === 'Smash' ? 'selected' : ''}>Smash</option>
                    <option value="Drop Shot" ${player.favoriteShot === 'Drop Shot' ? 'selected' : ''}>Drop Shot</option>
                    <option value="GLOBO" ${player.favoriteShot === 'GLOBO' ? 'selected' : ''}>GLOBO</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          
          <div style="margin-bottom: 24px;">
            <h4 style="color: #10b981; margin: 0 0 12px 0; font-size: 16px; font-weight: bold;">📊 Estadísticas (Solo Lectura)</h4>
            <div style="background: #374151; padding: 16px; border-radius: 8px;">
              <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; text-align: center;">
                <div style="background: #1f2937; padding: 12px; border-radius: 6px;">
                  <div style="font-size: 24px; font-weight: bold; color: #10b981;">${player.wins}</div>
                  <div style="font-size: 12px; color: #9ca3af;">Victorias</div>
                </div>
                <div style="background: #1f2937; padding: 12px; border-radius: 6px;">
                  <div style="font-size: 24px; font-weight: bold; color: #ef4444;">${player.losses}</div>
                  <div style="font-size: 12px; color: #9ca3af;">Derrotas</div>
                </div>
                <div style="background: #1f2937; padding: 12px; border-radius: 6px;">
                  <div style="font-size: 24px; font-weight: bold; color: #f59e0b;">${player.winRate.toFixed(1)}%</div>
                  <div style="font-size: 12px; color: #9ca3af;">% Victoria</div>
                </div>
                <div style="background: #1f2937; padding: 12px; border-radius: 6px;">
                  <div style="font-size: 24px; font-weight: bold; color: #3b82f6;">${player.matches}</div>
                  <div style="font-size: 12px; color: #9ca3af;">Partidos</div>
                </div>
              </div>
              <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #4b5563;">
                <p style="margin: 0; color: #9ca3af;"><strong>Último partido:</strong> ${player.lastMatch}</p>
                <p style="margin: 8px 0 0 0; color: #9ca3af;"><strong>Miembro desde:</strong> ${new Date(player.joinDate).toLocaleDateString('es-ES')}</p>
              </div>
            </div>
          </div>
          
          ${player.achievements.length > 0 ? `
          <div>
            <h4 style="color: #10b981; margin: 0 0 12px 0; font-size: 16px; font-weight: bold;">🏆 Logros y Reconocimientos (Solo Lectura)</h4>
            <div style="background: #374151; padding: 16px; border-radius: 8px;">
              <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                ${player.achievements.map(achievement => `
                  <span style="background: #065f46; color: #10b981; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: bold;">
                    ${achievement}
                  </span>
                `).join('')}
              </div>
            </div>
          </div>
          ` : ''}
        </div>
      `,
      confirmButtonText: 'Guardar Cambios',
      cancelButtonText: 'Cancelar',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      width: '900px',
      background: '#1f2937',
      color: '#e5e7eb',
      customClass: {
        popup: 'dark-modal',
        title: 'dark-modal-title',
        htmlContainer: 'dark-modal-content'
      },
      preConfirm: () => {
        const name = (document.getElementById('edit-name') as HTMLInputElement)?.value
        const email = (document.getElementById('edit-email') as HTMLInputElement)?.value
        const phone = (document.getElementById('edit-phone') as HTMLInputElement)?.value
        const playingStyle = (document.getElementById('edit-style') as HTMLSelectElement)?.value
        const favoriteShot = (document.getElementById('edit-shot') as HTMLSelectElement)?.value
        
        if (!name || !email || !phone) {
          Swal.showValidationMessage('Por favor complete todos los campos requeridos')
          return false
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
          Swal.showValidationMessage('Por favor ingrese un email válido')
          return false
        }
        
        return { name, email, phone, playingStyle, favoriteShot }
      }
    })

    if (formValues) {
      try {
        // Actualizar en Supabase
        await playersAPI.update(player.id, {
          name: formValues.name,
          email: formValues.email,
          phone: formValues.phone,
          playingStyle: formValues.playingStyle,
          favoriteShot: formValues.favoriteShot
        })

        // Recargar la lista desde Supabase
        await loadPlayers()
        
        await Swal.fire({
          title: '¡Perfil Actualizado!',
          text: `Los datos de ${formValues.name} han sido actualizados exitosamente.`,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        })
      } catch (error) {
        await Swal.fire({
          title: 'Error',
          text: `No se pudo actualizar el jugador: ${error.message}`,
          icon: 'error'
        })
      }
    }
  }

  const addPlayer = async () => {
    const { value: formValues } = await Swal.fire({
      title: 'Agregar Nuevo Jugador',
      html: `
        <div class="space-y-4 text-left">
          <div>
            <label class="block text-sm font-medium mb-1">Nombre Completo *</label>
            <input id="swal-input1" class="swal2-input" placeholder="Ej: Juan Pérez" style="margin: 0; width: 100%; box-sizing: border-box;">
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Email *</label>
            <input id="swal-input2" type="email" class="swal2-input" placeholder="juan.perez@email.com" style="margin: 0; width: 100%; box-sizing: border-box;">
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Teléfono *</label>
            <input id="swal-input3" class="swal2-input" placeholder="+56 9 1234 5678" style="margin: 0; width: 100%; box-sizing: border-box;">
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Estilo de Juego</label>
            <select id="swal-input4" class="swal2-input" style="margin: 0; width: 100%; box-sizing: border-box; background-color: white; color: black;">
              <option value="Agresivo">Agresivo</option>
              <option value="Defensivo">Defensivo</option>
              <option value="Completo">Completo</option>
              <option value="Red">Red</option>
              <option value="Consistente">Consistente</option>
              <option value="Táctico">Táctico</option>
              <option value="POING">POING</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Golpe Favorito</label>
            <select id="swal-input5" class="swal2-input" style="margin: 0; width: 100%; box-sizing: border-box; background-color: white; color: black;">
              <option value="Derecha">Derecha</option>
              <option value="Revés">Revés</option>
              <option value="Saque">Saque</option>
              <option value="Volea">Volea</option>
              <option value="Smash">Smash</option>
              <option value="Drop Shot">Drop Shot</option>
              <option value="GLOBO">GLOBO</option>
            </select>
          </div>
        </div>
      `,
      focusConfirm: false,
      confirmButtonText: 'Agregar Jugador',
      cancelButtonText: 'Cancelar',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#ef4444',
      customClass: {
        popup: 'swal-wide',
        htmlContainer: 'swal-html-container'
      },
      preConfirm: () => {
        const name = (document.getElementById('swal-input1') as HTMLInputElement)?.value
        const email = (document.getElementById('swal-input2') as HTMLInputElement)?.value
        const phone = (document.getElementById('swal-input3') as HTMLInputElement)?.value
        const playingStyle = (document.getElementById('swal-input4') as HTMLSelectElement)?.value
        const favoriteShot = (document.getElementById('swal-input5') as HTMLSelectElement)?.value
        
        if (!name || !email || !phone) {
          Swal.showValidationMessage('Por favor complete todos los campos requeridos')
          return false
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
          Swal.showValidationMessage('Por favor ingrese un email válido')
          return false
        }
        
        return { name, email, phone, playingStyle, favoriteShot }
      }
    })

    if (formValues) {
      try {
        // Mostrar loading
        Swal.fire({
          title: 'Guardando...',
          text: 'Agregando jugador a la base de datos',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading()
          }
        })

        // Crear jugador en Supabase
        const newPlayer = await playersAPI.create({
          name: formValues.name,
          email: formValues.email,
          phone: formValues.phone,
          favoriteShot: formValues.favoriteShot,
          playingStyle: formValues.playingStyle
        })

        console.log('✅ Jugador creado:', newPlayer)

        // Recargar la lista desde Supabase
        await loadPlayers()
        
        await Swal.fire({
          title: '¡Jugador Agregado!',
          text: `${formValues.name} ha sido agregado exitosamente al Tennis Open Club.`,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        })
      } catch (error) {
        console.error('❌ Error agregando jugador:', error)
        
        await Swal.fire({
          title: 'Error',
          text: `No se pudo agregar el jugador: ${error.message}`,
          icon: 'error',
          confirmButtonColor: '#ef4444'
        })
      }
    }
  }

  const filteredPlayers = players.filter(
    (player) =>
      player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Perfiles de Jugadores</h2>
          <p className="text-muted-foreground">Información detallada de todos los jugadores del Tennis Open Club</p>
        </div>
        <Button onClick={addPlayer}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar Jugador
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Buscar jugadores por nombre o email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full"></div>
            <span className="text-muted-foreground">Cargando jugadores...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded">
          <strong>Error:</strong> {error}
          <Button 
            onClick={loadPlayers} 
            variant="outline" 
            size="sm" 
            className="ml-3"
          >
            Reintentar
          </Button>
        </div>
      )}

      {/* Players Grid */}
      {!loading && !error && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredPlayers.map((player) => (
          <Card key={player.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-green-500 text-white text-lg">
                    {player.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-lg">{player.name}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">#{player.ranking}</Badge>
                    <span className="text-sm text-muted-foreground">{player.points} pts</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Contact Info */}
              <div className="space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Mail className="h-4 w-4 mr-2" />
                  {player.email}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Phone className="h-4 w-4 mr-2" />
                  {player.phone}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center p-2 bg-muted rounded">
                  <p className="font-bold text-lg">{player.wins}</p>
                  <p className="text-muted-foreground">Victorias</p>
                </div>
                <div className="text-center p-2 bg-muted rounded">
                  <p className="font-bold text-lg">{player.losses}</p>
                  <p className="text-muted-foreground">Derrotas</p>
                </div>
                <div className="text-center p-2 bg-muted rounded">
                  <p className="font-bold text-lg">{player.winRate.toFixed(1)}%</p>
                  <p className="text-muted-foreground">% Victoria</p>
                </div>
                <div className="text-center p-2 bg-muted rounded">
                  <p className="font-bold text-lg">{player.matches}</p>
                  <p className="text-muted-foreground">Partidos</p>
                </div>
              </div>

              {/* Playing Style */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Estilo:</span>
                  <span className="font-medium">{player.playingStyle}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Golpe favorito:</span>
                  <span className="font-medium">{player.favoriteShot}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Último partido:</span>
                  <span className="font-medium">{player.lastMatch}</span>
                </div>
              </div>

              {/* Achievements */}
              {player.achievements.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium flex items-center">
                    <Trophy className="h-4 w-4 mr-1" />
                    Logros
                  </p>
                  <div className="space-y-1">
                    {player.achievements.map((achievement, index) => (
                      <Badge key={index} variant="secondary" className="text-xs mr-1 mb-1">
                        {achievement}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1 bg-transparent" onClick={() => viewProfile(player)}>
                  Ver Perfil
                </Button>
                <Button size="sm" className="flex-1" onClick={() => editPlayer(player)}>
                  Editar
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="flex-1 bg-red-600 hover:bg-red-700" 
                  onClick={() => deletePlayer(player)}
                >
                  Eliminar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredPlayers.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No se encontraron jugadores que coincidan con la búsqueda
          </div>
        )}
        </div>
      )}
    </div>
  )
}
