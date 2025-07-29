"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Search, Plus, Trophy, Phone, Mail, User, Calendar, Target, Zap } from "lucide-react"
import { useState, useEffect } from "react"
import Swal from "sweetalert2"
import { playersAPI, storageAPI } from "@/lib/supabase"

export function PlayerProfiles() {
  const [searchTerm, setSearchTerm] = useState("")
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Add responsive modal styles
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
      const transformedPlayers = data.map(player => {
        console.log('🔍 Datos del jugador desde BD:', player.name, {
          id: player.id,
          avatar_url: player.avatar_url,
          avatar_path: player.avatar_path
        })
        return {
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
          achievements: player.achievements || [],
          avatar_url: player.avatar_url
        }
      })
      
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
            <img src="${player.avatar_url || '/logo.png'}" alt="${player.name}" style="width: 300px; height: 300px; border-radius: 16px; object-fit: cover; border: 4px solid #10b981; flex-shrink: 0;">
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
            <img src="${player.avatar_url || '/logo.png'}" alt="${player.name}" style="width: 200px; height: 200px; border-radius: 16px; object-fit: cover; border: 3px solid #10b981; margin: 0 auto 16px auto; display: block;">
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
      title: `<span style="color: #10b981; font-size: clamp(16px, 4vw, 20px); font-weight: bold;">✏️ Editar ${player.name}</span>`,
      html: `
        <style>
          @media (max-width: 768px) {
            .desktop-edit-header { display: none !important; }
            .mobile-edit-header { display: block !important; }
            .desktop-edit-grid { display: none !important; }
            .mobile-edit-grid { display: block !important; }
            .responsive-edit-form { padding: 12px !important; }
          }
          @media (min-width: 769px) {
            .desktop-edit-header { display: flex !important; }
            .mobile-edit-header { display: none !important; }
            .desktop-edit-grid { display: grid !important; }
            .mobile-edit-grid { display: none !important; }
          }
          .responsive-edit-form {
            padding: clamp(12px, 3vw, 20px);
            max-width: 100%;
            overflow-x: hidden;
            color: #e5e7eb;
            background: #1f2937;
            border-radius: 12px;
          }
          .responsive-edit-form .form-section {
            margin-bottom: clamp(16px, 4vw, 24px);
            background: #374151;
            padding: clamp(12px, 3vw, 16px);
            border-radius: 8px;
          }
          .responsive-edit-form .section-title {
            color: #10b981;
            font-size: clamp(14px, 3vw, 16px);
            font-weight: bold;
            margin-bottom: clamp(8px, 2vw, 12px);
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .responsive-edit-form .form-group {
            margin-bottom: clamp(12px, 3vw, 16px);
          }
          .responsive-edit-form .form-label {
            display: block;
            font-size: clamp(11px, 2.2vw, 12px);
            font-weight: 600;
            margin-bottom: 4px;
            color: #9ca3af;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .responsive-edit-form .form-input {
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
          .responsive-edit-form .form-input:focus {
            border-color: #10b981;
            outline: none;
            box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
          }
          .responsive-edit-form .stats-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: clamp(8px, 2vw, 16px);
            text-align: center;
          }
          @media (min-width: 640px) {
            .responsive-edit-form .stats-grid {
              grid-template-columns: repeat(4, 1fr);
            }
          }
          .responsive-edit-form .stat-card {
            background: #1f2937;
            padding: clamp(8px, 2vw, 12px);
            border-radius: 6px;
            border: 1px solid #4b5563;
          }
          .responsive-edit-form .stat-value {
            font-size: clamp(16px, 4vw, 24px);
            font-weight: bold;
            margin-bottom: 2px;
          }
          .responsive-edit-form .stat-label {
            font-size: clamp(10px, 2vw, 12px);
            color: #9ca3af;
          }
          .responsive-edit-form .wins { color: #10b981; }
          .responsive-edit-form .losses { color: #ef4444; }
          .responsive-edit-form .winrate { color: #f59e0b; }
          .responsive-edit-form .matches { color: #8b5cf6; }
          .responsive-edit-form .badge {
            background: #10b981;
            color: white;
            padding: clamp(4px, 1vw, 8px) clamp(8px, 2vw, 16px);
            border-radius: 8px;
            font-size: clamp(12px, 3vw, 16px);
            font-weight: bold;
            margin-right: 16px;
          }
          .responsive-edit-form .points {
            color: #9ca3af;
            font-size: clamp(14px, 3.5vw, 18px);
          }
        </style>
        <div class="responsive-edit-form">
          <!-- Desktop Layout -->
          <div class="desktop-edit-header" style="display: flex; align-items: flex-start; gap: 32px; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 1px solid #374151;">
            <div style="position: relative;">
              <img src="${player.avatar_url || '/logo.png'}" alt="${player.name}" style="width: clamp(200px, 25vw, 300px); height: clamp(200px, 25vw, 300px); border-radius: 16px; object-fit: cover; border: 4px solid #10b981; flex-shrink: 0;">
              <div style="position: absolute; bottom: -10px; right: -10px; background: #10b981; border-radius: 50%; padding: 8px; cursor: pointer;" onclick="document.getElementById('edit-avatar').click();">
                <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
            </div>
            <div style="flex: 1; padding-top: 20px;">
              <div class="form-group">
                <label class="form-label">📷 Cambiar Foto</label>
                <input id="edit-avatar" type="file" class="form-input" accept="image/*" style="padding: 8px; cursor: pointer; margin-bottom: 12px;">
                <p style="font-size: 11px; color: #9ca3af; margin-bottom: 16px;">Formatos: JPG, PNG, GIF (Max: 5MB)</p>
              </div>
              <div class="form-group">
                <label class="form-label">👤 Nombre Completo *</label>
                <input id="edit-name" value="${player.name}" class="form-input" required style="font-size: clamp(18px, 4vw, 24px); font-weight: bold; margin-bottom: 16px;">
              </div>
              <div style="display: flex; align-items: center; gap: 16px; margin: 16px 0; flex-wrap: wrap;">
                <span class="badge">#${player.ranking || 'N/A'}</span>
                <span class="points">${player.points || 0} puntos</span>
              </div>
              <p style="margin: 16px 0 0 0; color: #9ca3af; font-size: clamp(14px, 3vw, 16px);"><strong>Miembro desde:</strong> ${player.joinDate ? new Date(player.joinDate).toLocaleDateString('es-ES') : 'N/A'}</p>
              <p style="margin: 8px 0 0 0; color: #9ca3af; font-size: clamp(14px, 3vw, 16px);"><strong>Último partido:</strong> ${player.lastMatch || 'N/A'}</p>
            </div>
          </div>
          
          <!-- Mobile Layout -->
          <div class="mobile-edit-header" style="display: none; text-align: center; margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1px solid #374151;">
            <div style="position: relative; display: inline-block;">
              <img src="${player.avatar_url || '/logo.png'}" alt="${player.name}" style="width: clamp(150px, 40vw, 200px); height: clamp(150px, 40vw, 200px); border-radius: 16px; object-fit: cover; border: 3px solid #10b981; margin: 0 auto 16px auto; display: block;">
              <div style="position: absolute; bottom: 6px; right: -10px; background: #10b981; border-radius: 50%; padding: 6px; cursor: pointer;" onclick="document.getElementById('edit-avatar-mobile').click();">
                <svg width="16" height="16" fill="white" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">📷 Cambiar Foto</label>
              <input id="edit-avatar-mobile" type="file" class="form-input" accept="image/*" style="padding: 8px; cursor: pointer; margin-bottom: 12px;">
              <p style="font-size: 11px; color: #9ca3af; margin-bottom: 16px;">Formatos: JPG, PNG, GIF (Max: 5MB)</p>
            </div>
            <div class="form-group">
              <label class="form-label">👤 Nombre Completo *</label>
              <input id="edit-name-mobile" value="${player.name}" class="form-input" required style="font-size: clamp(18px, 5vw, 24px); font-weight: bold; text-align: center;">
            </div>
            <div style="display: flex; align-items: center; justify-content: center; gap: 12px; margin: 12px 0; flex-wrap: wrap;">
              <span class="badge">#${player.ranking || 'N/A'}</span>
              <span class="points">${player.points || 0} puntos</span>
            </div>
            <p style="margin: 12px 0 0 0; color: #9ca3af; font-size: clamp(12px, 3vw, 14px);"><strong>Miembro desde:</strong> ${player.joinDate ? new Date(player.joinDate).toLocaleDateString('es-ES') : 'N/A'}</p>
            <p style="margin: 6px 0 0 0; color: #9ca3af; font-size: clamp(12px, 3vw, 14px);"><strong>Último partido:</strong> ${player.lastMatch || 'N/A'}</p>
          </div>
          
          <!-- Desktop Grid -->
          <div class="desktop-edit-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px;">
            <div class="form-section">
              <div class="section-title">📧 Información de Contacto</div>
              <div class="form-group">
                <label class="form-label">Email</label>
                <input id="edit-email" value="${player.email}" type="email" class="form-input" required>
              </div>
              <div class="form-group">
                <label class="form-label">Teléfono</label>
                <input id="edit-phone" value="${player.phone}" type="tel" class="form-input" required>
              </div>
            </div>
            
            <div class="form-section">
              <div class="section-title">🎾 Estilo de Juego</div>
              <div class="form-group">
                <label class="form-label">Estilo</label>
                <select id="edit-style" class="form-input">
                  <option value="Agresivo" ${player.playingStyle === 'Agresivo' ? 'selected' : ''}>🔥 Agresivo</option>
                  <option value="Defensivo" ${player.playingStyle === 'Defensivo' ? 'selected' : ''}>🛡️ Defensivo</option>
                  <option value="Completo" ${player.playingStyle === 'Completo' ? 'selected' : ''}>⭐ Completo</option>
                  <option value="Red" ${player.playingStyle === 'Red' ? 'selected' : ''}>🥅 Red</option>
                  <option value="Consistente" ${player.playingStyle === 'Consistente' ? 'selected' : ''}>📈 Consistente</option>
                  <option value="Táctico" ${player.playingStyle === 'Táctico' ? 'selected' : ''}>🧠 Táctico</option>
                  <option value="POING" ${player.playingStyle === 'POING' ? 'selected' : ''}>💪 POING</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Golpe Favorito</label>
                <select id="edit-shot" class="form-input">
                  <option value="Derecha" ${player.favoriteShot === 'Derecha' ? 'selected' : ''}>➡️ Derecha</option>
                  <option value="Revés" ${player.favoriteShot === 'Revés' ? 'selected' : ''}>⬅️ Revés</option>
                  <option value="Saque" ${player.favoriteShot === 'Saque' ? 'selected' : ''}>⬆️ Saque</option>
                  <option value="Volea" ${player.favoriteShot === 'Volea' ? 'selected' : ''}>🔄 Volea</option>
                  <option value="Smash" ${player.favoriteShot === 'Smash' ? 'selected' : ''}>💥 Smash</option>
                  <option value="Drop Shot" ${player.favoriteShot === 'Drop Shot' ? 'selected' : ''}>🎯 Drop Shot</option>
                  <option value="GLOBO" ${player.favoriteShot === 'GLOBO' ? 'selected' : ''}>🌟 GLOBO</option>
                </select>
              </div>
            </div>
          </div>
          
          <!-- Mobile Grid -->
          <div class="mobile-edit-grid" style="display: none;">
            <div class="form-section">
              <div class="section-title">📧 Información de Contacto</div>
              <div class="form-group">
                <label class="form-label">Email</label>
                <input id="edit-email-mobile" value="${player.email}" type="email" class="form-input" required>
              </div>
              <div class="form-group">
                <label class="form-label">Teléfono</label>
                <input id="edit-phone-mobile" value="${player.phone}" type="tel" class="form-input" required>
              </div>
            </div>
            
            <div class="form-section">
              <div class="section-title">🎾 Estilo de Juego</div>
              <div class="form-group">
                <label class="form-label">Estilo</label>
                <select id="edit-style-mobile" class="form-input">
                  <option value="Agresivo" ${player.playingStyle === 'Agresivo' ? 'selected' : ''}>🔥 Agresivo</option>
                  <option value="Defensivo" ${player.playingStyle === 'Defensivo' ? 'selected' : ''}>🛡️ Defensivo</option>
                  <option value="Completo" ${player.playingStyle === 'Completo' ? 'selected' : ''}>⭐ Completo</option>
                  <option value="Red" ${player.playingStyle === 'Red' ? 'selected' : ''}>🥅 Red</option>
                  <option value="Consistente" ${player.playingStyle === 'Consistente' ? 'selected' : ''}>📈 Consistente</option>
                  <option value="Táctico" ${player.playingStyle === 'Táctico' ? 'selected' : ''}>🧠 Táctico</option>
                  <option value="POING" ${player.playingStyle === 'POING' ? 'selected' : ''}>💪 POING</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Golpe Favorito</label>
                <select id="edit-shot-mobile" class="form-input">
                  <option value="Derecha" ${player.favoriteShot === 'Derecha' ? 'selected' : ''}>➡️ Derecha</option>
                  <option value="Revés" ${player.favoriteShot === 'Revés' ? 'selected' : ''}>⬅️ Revés</option>
                  <option value="Saque" ${player.favoriteShot === 'Saque' ? 'selected' : ''}>⬆️ Saque</option>
                  <option value="Volea" ${player.favoriteShot === 'Volea' ? 'selected' : ''}>🔄 Volea</option>
                  <option value="Smash" ${player.favoriteShot === 'Smash' ? 'selected' : ''}>💥 Smash</option>
                  <option value="Drop Shot" ${player.favoriteShot === 'Drop Shot' ? 'selected' : ''}>🎯 Drop Shot</option>
                  <option value="GLOBO" ${player.favoriteShot === 'GLOBO' ? 'selected' : ''}>🌟 GLOBO</option>
                </select>
              </div>
            </div>
          </div>
          
          <div class="form-section">
            <div class="section-title">📊 Estadísticas (Solo Lectura)</div>
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-value wins">${player.wins || 0}</div>
                <div class="stat-label">Victorias</div>
              </div>
              <div class="stat-card">
                <div class="stat-value losses">${player.losses || 0}</div>
                <div class="stat-label">Derrotas</div>
              </div>
              <div class="stat-card">
                <div class="stat-value winrate">${player.winRate?.toFixed(1) || '0.0'}%</div>
                <div class="stat-label">% Victoria</div>
              </div>
              <div class="stat-card">
                <div class="stat-value matches">${player.matches || 0}</div>
                <div class="stat-label">Partidos</div>
              </div>
            </div>
            <div style="margin-top: clamp(12px, 3vw, 16px); padding-top: clamp(12px, 3vw, 16px); border-top: 1px solid #e5e7eb; font-size: clamp(12px, 2.5vw, 14px); color: #6b7280;">
              <p style="margin: 0;"><strong>Último partido:</strong> ${player.lastMatch || 'N/A'}</p>
              <p style="margin: clamp(4px, 1vw, 8px) 0 0 0;"><strong>Miembro desde:</strong> ${player.joinDate ? new Date(player.joinDate).toLocaleDateString('es-ES') : 'N/A'}</p>
            </div>
          </div>
          
          ${(player.achievements && player.achievements.length > 0) ? `
          <div class="form-section">
            <div class="section-title">🏆 Logros y Reconocimientos</div>
            <div style="display: flex; flex-wrap: wrap; gap: clamp(6px, 1.5vw, 8px);">
              ${player.achievements.map(achievement => `
                <span style="background: #10b981; color: white; padding: clamp(4px, 1vw, 6px) clamp(8px, 2vw, 12px); border-radius: 20px; font-size: clamp(10px, 2vw, 12px); font-weight: bold;">
                  ${achievement}
                </span>
              `).join('')}
            </div>
          </div>
          ` : ''}
        </div>
      `,
      confirmButtonText: '💾 Guardar Cambios',
      cancelButtonText: '❌ Cancelar',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      width: 'clamp(320px, 95vw, 900px)',
      background: '#1f2937',
      color: '#e5e7eb',
      customClass: {
        popup: 'responsive-modal dark-modal',
        htmlContainer: 'swal-html-container',
        title: 'dark-modal-title'
      },
      preConfirm: () => {
        // Detectar si estamos en mobile o desktop basado en qué input está visible
        const isMobile = window.innerWidth <= 768
        
        const avatarInput = isMobile 
          ? document.getElementById('edit-avatar-mobile') as HTMLInputElement
          : document.getElementById('edit-avatar') as HTMLInputElement
        const avatarFile = avatarInput?.files?.[0] || null
        
        const name = isMobile 
          ? (document.getElementById('edit-name-mobile') as HTMLInputElement)?.value
          : (document.getElementById('edit-name') as HTMLInputElement)?.value
        const email = isMobile 
          ? (document.getElementById('edit-email-mobile') as HTMLInputElement)?.value
          : (document.getElementById('edit-email') as HTMLInputElement)?.value
        const phone = isMobile 
          ? (document.getElementById('edit-phone-mobile') as HTMLInputElement)?.value
          : (document.getElementById('edit-phone') as HTMLInputElement)?.value
        const playingStyle = isMobile 
          ? (document.getElementById('edit-style-mobile') as HTMLSelectElement)?.value
          : (document.getElementById('edit-style') as HTMLSelectElement)?.value
        const favoriteShot = isMobile 
          ? (document.getElementById('edit-shot-mobile') as HTMLSelectElement)?.value
          : (document.getElementById('edit-shot') as HTMLSelectElement)?.value

        // Validar tamaño de archivo
        if (avatarFile && avatarFile.size > 5 * 1024 * 1024) {
          Swal.showValidationMessage('El archivo de imagen debe ser menor a 5MB')
          return false
        }
        
        if (!name || !email || !phone) {
          Swal.showValidationMessage('Por favor complete todos los campos requeridos')
          return false
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
          Swal.showValidationMessage('Por favor ingrese un email válido')
          return false
        }
        
        return { name, email, phone, playingStyle, favoriteShot, avatarFile }
      }
    })

    if (formValues) {
      try {
        // Actualizar en Supabase (con avatar si existe)
        await playersAPI.update(player.id, {
          name: formValues.name,
          email: formValues.email,
          phone: formValues.phone,
          playingStyle: formValues.playingStyle,
          favoriteShot: formValues.favoriteShot
        }, formValues.avatarFile)

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
      title: '<span style="color: #10b981; font-size: clamp(18px, 4vw, 24px); font-weight: bold;">🎾 Agregar Nuevo Jugador</span>',
      html: `
        <style>
          .responsive-add-form {
            padding: clamp(12px, 3vw, 20px);
            max-width: 100%;
            overflow-x: hidden;
            color: #e5e7eb;
            background: #1f2937;
            border-radius: 12px;
          }
          .responsive-add-form .form-group {
            margin-bottom: clamp(12px, 3vw, 16px);
            background: #374151;
            padding: clamp(12px, 3vw, 16px);
            border-radius: 8px;
          }
          .responsive-add-form label {
            display: block;
            font-size: clamp(12px, 2.5vw, 14px);
            font-weight: 600;
            margin-bottom: 6px;
            color: #10b981;
            text-align: left;
          }
          .responsive-add-form .form-input {
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
          .responsive-add-form .form-input:focus {
            border-color: #10b981;
            outline: none;
            box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
          }
          .responsive-add-form .form-input::placeholder {
            color: #9ca3af;
            font-size: clamp(12px, 2.5vw, 14px);
          }
          .responsive-add-form .form-row {
            display: grid;
            grid-template-columns: 1fr;
            gap: clamp(12px, 3vw, 16px);
            background: transparent;
            padding: 0;
            border-radius: 0;
          }
          @media (min-width: 640px) {
            .responsive-add-form .form-row {
              grid-template-columns: 1fr 1fr;
            }
          }
          .responsive-add-form .icon-input {
            position: relative;
          }
          .responsive-add-form .icon-input::before {
            content: attr(data-icon);
            position: absolute;
            left: 12px;
            top: 50%;
            transform: translateY(-50%);
            font-size: clamp(14px, 3vw, 16px);
            color: #10b981;
            z-index: 1;
          }
          .responsive-add-form .icon-input .form-input {
            padding-left: clamp(35px, 8vw, 40px);
          }
        </style>
        <div class="responsive-add-form">
          <div class="form-group">
            <label for="add-avatar">📷 Foto del Jugador</label>
            <input 
              id="add-avatar" 
              type="file" 
              class="form-input" 
              accept="image/*"
              style="padding: 8px; cursor: pointer;"
            >
            <p style="font-size: 11px; color: #9ca3af; margin-top: 4px;">Formatos soportados: JPG, PNG, GIF (Max: 5MB)</p>
          </div>
          
          <div class="form-group">
            <label for="add-name">👤 Nombre Completo *</label>
            <div class="icon-input" data-icon="🏷️">
              <input 
                id="add-name" 
                class="form-input" 
                placeholder="Ej: Juan Pérez García" 
                required
                autocomplete="name"
              >
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="add-email">📧 Email *</label>
              <div class="icon-input" data-icon="@">
                <input 
                  id="add-email" 
                  type="email" 
                  class="form-input" 
                  placeholder="juan.perez@email.com"
                  required
                  autocomplete="email"
                >
              </div>
            </div>
            
            <div class="form-group">
              <label for="add-phone">📱 Teléfono *</label>
              <div class="icon-input" data-icon="📞">
                <input 
                  id="add-phone" 
                  type="tel" 
                  class="form-input" 
                  placeholder="+56 9 1234 5678"
                  required
                  autocomplete="tel"
                >
              </div>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="add-style">🎯 Estilo de Juego</label>
              <select id="add-style" class="form-input">
                <option value="">Seleccionar estilo...</option>
                <option value="Agresivo">🔥 Agresivo</option>
                <option value="Defensivo">🛡️ Defensivo</option>
                <option value="Completo">⭐ Completo</option>
                <option value="Red">🥅 Red</option>
                <option value="Consistente">📈 Consistente</option>
                <option value="Táctico">🧠 Táctico</option>
                <option value="POING">💪 POING</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="add-shot">🎾 Golpe Favorito</label>
              <select id="add-shot" class="form-input">
                <option value="">Seleccionar golpe...</option>
                <option value="Derecha">➡️ Derecha</option>
                <option value="Revés">⬅️ Revés</option>
                <option value="Saque">⬆️ Saque</option>
                <option value="Volea">🔄 Volea</option>
                <option value="Smash">💥 Smash</option>
                <option value="Drop Shot">🎯 Drop Shot</option>
                <option value="GLOBO">🌟 GLOBO</option>
              </select>
            </div>
          </div>
        </div>
      `,
      focusConfirm: false,
      confirmButtonText: '✅ Agregar Jugador',
      cancelButtonText: '❌ Cancelar',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#ef4444',
      width: 'clamp(320px, 95vw, 700px)',
      background: '#1f2937',
      color: '#e5e7eb',
      customClass: {
        popup: 'responsive-modal dark-modal',
        htmlContainer: 'swal-html-container',
        title: 'dark-modal-title'
      },
      preConfirm: () => {
        const avatarInput = document.getElementById('add-avatar') as HTMLInputElement
        const avatarFile = avatarInput?.files?.[0] || null
        const name = (document.getElementById('add-name') as HTMLInputElement)?.value
        const email = (document.getElementById('add-email') as HTMLInputElement)?.value
        const phone = (document.getElementById('add-phone') as HTMLInputElement)?.value
        const playingStyle = (document.getElementById('add-style') as HTMLSelectElement)?.value
        const favoriteShot = (document.getElementById('add-shot') as HTMLSelectElement)?.value

        // Validar tamaño de archivo
        if (avatarFile && avatarFile.size > 5 * 1024 * 1024) {
          Swal.showValidationMessage('El archivo de imagen debe ser menor a 5MB')
          return false
        }
        
        if (!name || !email || !phone) {
          Swal.showValidationMessage('Por favor complete todos los campos requeridos')
          return false
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
          Swal.showValidationMessage('Por favor ingrese un email válido')
          return false
        }
        
        return { name, email, phone, playingStyle, favoriteShot, avatarFile }
      }
    })

    if (formValues) {
      try {
        // Mostrar loading
        Swal.fire({
          title: 'Guardando...',
          text: formValues.avatarFile ? 'Subiendo imagen y creando jugador...' : 'Agregando jugador a la base de datos',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading()
          }
        })

        // Crear jugador en Supabase (con avatar si existe)
        const newPlayer = await playersAPI.create({
          name: formValues.name,
          email: formValues.email,
          phone: formValues.phone,
          favoriteShot: formValues.favoriteShot,
          playingStyle: formValues.playingStyle
        }, formValues.avatarFile)

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
                  <AvatarImage 
                    src={player.avatar_url} 
                    alt={player.name}
                    onLoad={() => console.log('✅ Avatar cargado para:', player.name, player.avatar_url)}
                    onError={() => console.log('❌ Error cargando avatar para:', player.name, player.avatar_url)}
                  />
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
