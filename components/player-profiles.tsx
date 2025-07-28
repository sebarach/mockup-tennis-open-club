"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Search, Plus, Trophy, Phone, Mail, User, Calendar, Target, Zap } from "lucide-react"
import { useState } from "react"
import Swal from "sweetalert2"

export function PlayerProfiles() {
  const [searchTerm, setSearchTerm] = useState("")
  const [players, setPlayers] = useState([
    {
      id: 1,
      name: "José Galaz",
      email: "jose.galaz@email.com",
      phone: "+56 9 1234 5678",
      ranking: 1,
      points: 245,
      matches: 999,
      wins: 999,
      losses: 0,
      winRate: 100.0,
      joinDate: "2023-03-15",
      lastMatch: "2024-01-14",
      favoriteShot: "Derecha",
      playingStyle: "Agresivo",
      achievements: ["Campeón Copa Fin de Año 2023", "Mejor Racha 2023"],
    },
    {
      id: 2,
      name: "Felipe Varas",
      email: "felipe.varas@email.com",
      phone: "+56 9 2345 6789",
      ranking: 2,
      points: 238,
      matches: 11,
      wins: 9,
      losses: 2,
      winRate: 81.8,
      joinDate: "2023-02-20",
      lastMatch: "2024-01-13",
      favoriteShot: "Revés",
      playingStyle: "Defensivo",
      achievements: ["Campeón Liga Otoño 2023", "Finalista Copa Fin de Año 2023"],
    },
    {
      id: 3,
      name: "Marco Espinoza",
      email: "marco.espinoza@email.com",
      phone: "+56 9 3456 7890",
      ranking: 3,
      points: 232,
      matches: 13,
      wins: 9,
      losses: 4,
      winRate: 69.2,
      joinDate: "2023-01-10",
      lastMatch: "2024-01-13",
      favoriteShot: "Saque",
      playingStyle: "Completo",
      achievements: ["Campeón Torneo Invierno 2023", "Jugador Más Activo 2023"],
    },
    {
      id: 4,
      name: "Daniel Vera",
      email: "daniel.vera@email.com",
      phone: "+56 9 4567 8901",
      ranking: 4,
      points: 225,
      matches: 10,
      wins: 8,
      losses: 2,
      winRate: 80.0,
      joinDate: "2023-04-05",
      lastMatch: "2024-01-12",
      favoriteShot: "Volea",
      playingStyle: "Red",
      achievements: ["Finalista Torneo Invierno 2023", "Mayor Ascenso 2024"],
    },
    {
      id: 5,
      name: "Cristhian Vidal",
      email: "cristhian.vidal@email.com",
      phone: "+56 9 5678 9012",
      ranking: 5,
      points: 218,
      matches: 12,
      wins: 8,
      losses: 4,
      winRate: 66.7,
      joinDate: "2023-05-12",
      lastMatch: "2024-01-11",
      favoriteShot: "Derecha",
      playingStyle: "Consistente",
      achievements: ["Top 5 Consistente 2023"],
    },
    {
      id: 6,
      name: "Nelson Molina",
      email: "nelson.molina@email.com",
      phone: "+56 9 6789 0123",
      ranking: 7,
      points: 195,
      matches: 10,
      wins: 6,
      losses: 4,
      winRate: 60.0,
      joinDate: "2023-06-18",
      lastMatch: "2024-01-14",
      favoriteShot: "Revés",
      playingStyle: "Táctico",
      achievements: ["Mejor Deportividad 2023"],
    },
  ])

  const viewProfile = async (player: typeof players[0]) => {
    await Swal.fire({
      title: `Perfil de ${player.name}`,
      html: `
        <div class="player-profile-modal" style="text-align: left; color: #e5e7eb; background: #1f2937; padding: 20px; border-radius: 12px;">
          <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1px solid #374151;">
            <img src="/placeholder-user.jpg" alt="${player.name}" style="width: 150px; height: 150px; border-radius: 12px; object-fit: cover; border: 3px solid #10b981;">
            <div>
              <h3 style="margin: 0; font-size: 24px; font-weight: bold; color: #f9fafb;">${player.name}</h3>
              <div style="display: flex; align-items: center; gap: 10px; margin: 8px 0;">
                <span style="background: #10b981; color: white; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: bold;">#${player.ranking}</span>
                <span style="color: #9ca3af;">${player.points} puntos</span>
              </div>
              <p style="margin: 8px 0 0 0; color: #9ca3af;">Miembro desde: ${new Date(player.joinDate).toLocaleDateString('es-ES')}</p>
            </div>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px;">
            <div>
              <h4 style="color: #10b981; margin: 0 0 12px 0; font-size: 16px; font-weight: bold;">📧 Información de Contacto</h4>
              <div style="background: #374151; padding: 16px; border-radius: 8px;">
                <p style="margin: 0 0 8px 0;"><strong>Email:</strong> ${player.email}</p>
                <p style="margin: 0;"><strong>Teléfono:</strong> ${player.phone}</p>
              </div>
            </div>
            
            <div>
              <h4 style="color: #10b981; margin: 0 0 12px 0; font-size: 16px; font-weight: bold;">🎾 Estilo de Juego</h4>
              <div style="background: #374151; padding: 16px; border-radius: 8px;">
                <p style="margin: 0 0 8px 0;"><strong>Estilo:</strong> ${player.playingStyle}</p>
                <p style="margin: 0;"><strong>Golpe Favorito:</strong> ${player.favoriteShot}</p>
              </div>
            </div>
          </div>
          
          <div style="margin-bottom: 24px;">
            <h4 style="color: #10b981; margin: 0 0 12px 0; font-size: 16px; font-weight: bold;">📊 Estadísticas</h4>
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
              </div>
            </div>
          </div>
          
          ${player.achievements.length > 0 ? `
          <div>
            <h4 style="color: #10b981; margin: 0 0 12px 0; font-size: 16px; font-weight: bold;">🏆 Logros y Reconocimientos</h4>
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
      confirmButtonText: 'Cerrar',
      confirmButtonColor: '#10b981',
      width: '800px',
      background: '#1f2937',
      color: '#e5e7eb',
      customClass: {
        popup: 'dark-modal',
        title: 'dark-modal-title',
        htmlContainer: 'dark-modal-content'
      }
    })
  }

  const editPlayer = async (player: typeof players[0]) => {
    const { value: formValues } = await Swal.fire({
      title: `Editar Perfil de ${player.name}`,
      html: `
        <div class="player-edit-modal" style="text-align: left; color: #e5e7eb; background: #1f2937; padding: 20px; border-radius: 12px;">
          <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1px solid #374151;">
            <img src="/placeholder-user.jpg" alt="${player.name}" style="width: 150px; height: 150px; border-radius: 12px; object-fit: cover; border: 3px solid #10b981;">
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
      const updatedPlayers = players.map(p => {
        if (p.id === player.id) {
          return {
            ...p,
            name: formValues.name,
            email: formValues.email,
            phone: formValues.phone,
            playingStyle: formValues.playingStyle,
            favoriteShot: formValues.favoriteShot
          }
        }
        return p
      })
      
      setPlayers(updatedPlayers)
      
      await Swal.fire({
        title: '¡Perfil Actualizado!',
        text: `Los datos de ${formValues.name} han sido actualizados exitosamente.`,
        icon: 'success',
        confirmButtonColor: '#10b981',
        timer: 3000,
        timerProgressBar: true,
        background: '#1f2937',
        color: '#e5e7eb'
      })
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
      const newPlayer = {
        id: players.length + 1,
        name: formValues.name,
        email: formValues.email,
        phone: formValues.phone,
        ranking: players.length + 1,
        points: 0,
        matches: 0,
        wins: 0,
        losses: 0,
        winRate: 0,
        joinDate: new Date().toISOString().split('T')[0],
        lastMatch: '-',
        favoriteShot: formValues.favoriteShot,
        playingStyle: formValues.playingStyle,
        achievements: [],
      }
      
      setPlayers([...players, newPlayer])
      
      await Swal.fire({
        title: '¡Jugador Agregado!',
        text: `${formValues.name} ha sido agregado exitosamente a la liga.`,
        icon: 'success',
        confirmButtonColor: '#10b981',
        timer: 3000,
        timerProgressBar: true
      })
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
          <p className="text-muted-foreground">Información detallada de todos los jugadores de la liga</p>
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

      {/* Players Grid */}
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
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPlayers.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No se encontraron jugadores que coincidan con la búsqueda
        </div>
      )}
    </div>
  )
}
