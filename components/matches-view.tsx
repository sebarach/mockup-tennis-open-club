import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin, Plus } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"
import Swal from "sweetalert2"

export function MatchesView() {
  const [upcomingMatches, setUpcomingMatches] = useState([
    {
      id: 1,
      player1: "Daniel Vera",
      player2: "Diego Amaya",
      date: "2024-01-15",
      time: "18:00",
      court: "Cancha 1",
      venue: "Amador Donoso",
      status: "Programado",
    },
    {
      id: 2,
      player1: "Roberto Medina",
      player2: "Danilo Milla",
      date: "2024-01-15",
      time: "19:30",
      court: "Cancha 2",
      venue: "Laurita Vicuña",
      status: "Programado",
    },
    {
      id: 3,
      player1: "Ignacio Cid",
      player2: "Sebastian Sepulveda",
      date: "2024-01-16",
      time: "17:00",
      court: "Cancha 1",
      venue: "Amador Donoso",
      status: "Programado",
    },
  ])

  const availablePlayers = [
    "José Galaz", "Felipe Varas", "Marco Espinoza", "Daniel Vera", "Cristhian Vidal",
    "Nelson Molina", "Diego Amaya", "Roberto Medina", "Danilo Milla", "Ignacio Cid",
    "Sebastian Sepulveda", "Franco Maura", "Eduardo Farias", "Kabir Manzul", "Rodrigo Arratia"
  ]

  const scheduleMatch = async () => {
    // Generate time options (every 30 minutes from 6:00 to 23:00)
    const timeOptions = []
    for (let hour = 6; hour <= 23; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        const displayTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        timeOptions.push(`<option value="${timeString}">${displayTime}</option>`)
      }
    }

    // Generate date options for next 30 days
    const dateOptions = []
    const today = new Date()
    for (let i = 0; i < 30; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      const dateString = date.toISOString().split('T')[0]
      const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
      const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
      const dayName = dayNames[date.getDay()]
      const monthName = monthNames[date.getMonth()]
      const displayDate = `${dayName} ${date.getDate()} de ${monthName}, ${date.getFullYear()}`
      dateOptions.push(`<option value="${dateString}">${displayDate}</option>`)
    }

    const { value: formValues } = await Swal.fire({
      title: 'Programar Nuevo Partido',
      html: `
        <div class="space-y-4 text-left">
          <div>
            <label class="block text-sm font-medium mb-1">Jugador 1 *</label>
            <select id="swal-player1" class="swal2-input" style="margin: 0; width: 100%; box-sizing: border-box;">
              <option value="">Seleccionar jugador...</option>
              ${availablePlayers.map(player => `<option value="${player}">${player}</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Jugador 2 *</label>
            <select id="swal-player2" class="swal2-input" style="margin: 0; width: 100%; box-sizing: border-box;">
              <option value="">Seleccionar jugador...</option>
              ${availablePlayers.map(player => `<option value="${player}">${player}</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Fecha *</label>
            <select id="swal-date" class="swal2-input" style="margin: 0; width: 100%; box-sizing: border-box;">
              <option value="">Seleccionar fecha...</option>
              ${dateOptions.join('')}
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Hora *</label>
            <select id="swal-time" class="swal2-input" style="margin: 0; width: 100%; box-sizing: border-box;">
              <option value="">Seleccionar hora...</option>
              ${timeOptions.join('')}
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Club *</label>
            <select id="swal-venue" class="swal2-input" style="margin: 0; width: 100%; box-sizing: border-box;" onchange="updateCourts()">
              <option value="">Seleccionar club...</option>
              <option value="Amador Donoso">Amador Donoso</option>
              <option value="Laurita Vicuña">Laurita Vicuña</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Cancha *</label>
            <select id="swal-court" class="swal2-input" style="margin: 0; width: 100%; box-sizing: border-box;" disabled>
              <option value="">Primero selecciona un club...</option>
            </select>
          </div>
        </div>
      `,
      focusConfirm: false,
      confirmButtonText: 'Programar Partido',
      cancelButtonText: 'Cancelar',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#ef4444',
      width: 500,
      customClass: {
        popup: 'swal-wide',
        htmlContainer: 'swal-html-container'
      },
      didRender: () => {
        // Apply white background to all select and input elements
        const inputs = document.querySelectorAll('#swal-player1, #swal-player2, #swal-date, #swal-time, #swal-venue, #swal-court')
        inputs.forEach((input: any) => {
          input.style.backgroundColor = 'white'
          input.style.color = 'black'
          input.style.border = '1px solid #d1d5db'
          input.style.borderRadius = '6px'
          input.style.padding = '8px 12px'
          input.style.fontSize = '14px'
        })
      },
      didOpen: () => {
        // Function to update courts based on selected venue
        (window as any).updateCourts = () => {
          const venueSelect = document.getElementById('swal-venue') as HTMLSelectElement
          const courtSelect = document.getElementById('swal-court') as HTMLSelectElement
          const selectedVenue = venueSelect.value
          
          courtSelect.innerHTML = '<option value="">Seleccionar cancha...</option>'
          courtSelect.disabled = !selectedVenue
          
          if (selectedVenue === 'Amador Donoso') {
            ['Cancha 1', 'Cancha 2', 'Cancha 3'].forEach(court => {
              const option = document.createElement('option')
              option.value = court
              option.textContent = court
              courtSelect.appendChild(option)
            })
          } else if (selectedVenue === 'Laurita Vicuña') {
            ['Cancha A', 'Cancha B', 'Cancha C'].forEach(court => {
              const option = document.createElement('option')
              option.value = court
              option.textContent = court
              courtSelect.appendChild(option)
            })
          }
        }
      },
      preConfirm: () => {
        const player1 = (document.getElementById('swal-player1') as HTMLSelectElement)?.value
        const player2 = (document.getElementById('swal-player2') as HTMLSelectElement)?.value
        const date = (document.getElementById('swal-date') as HTMLSelectElement)?.value
        const time = (document.getElementById('swal-time') as HTMLSelectElement)?.value
        const venue = (document.getElementById('swal-venue') as HTMLSelectElement)?.value
        const court = (document.getElementById('swal-court') as HTMLSelectElement)?.value
        
        if (!player1 || !player2 || !date || !time || !venue || !court) {
          Swal.showValidationMessage('Por favor complete todos los campos requeridos')
          return false
        }
        
        if (player1 === player2) {
          Swal.showValidationMessage('Los jugadores deben ser diferentes')
          return false
        }
        
        const selectedDate = new Date(date)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        
        if (selectedDate < today) {
          Swal.showValidationMessage('La fecha no puede ser anterior a hoy')
          return false
        }
        
        return { player1, player2, date, time, venue, court }
      }
    })

    if (formValues) {
      const newMatch = {
        id: upcomingMatches.length + 1,
        player1: formValues.player1,
        player2: formValues.player2,
        date: formValues.date,
        time: formValues.time,
        court: formValues.court,
        venue: formValues.venue,
        status: "Programado",
      }
      
      setUpcomingMatches([...upcomingMatches, newMatch])
      
      await Swal.fire({
        title: '¡Partido Programado!',
        html: `
          <div class="text-center">
            <p><strong>${formValues.player1}</strong> vs <strong>${formValues.player2}</strong></p>
            <p>📅 ${formValues.date} a las ${formValues.time}</p>
            <p>🏟️ ${formValues.venue} - ${formValues.court}</p>
          </div>
        `,
        icon: 'success',
        confirmButtonColor: '#10b981',
        timer: 4000,
        timerProgressBar: true
      })
    }
  }

  const recentMatches = [
    {
      id: 1,
      player1: "José Galaz",
      player2: "Nelson Molina",
      score: "6-2, 6-4",
      date: "2024-01-14",
      winner: "José Galaz",
      duration: "1h 25min",
    },
    {
      id: 2,
      player1: "Marco Espinoza",
      player2: "Kabir Manzul",
      score: "6-4, 4-6, 6-3",
      date: "2024-01-13",
      winner: "Marco Espinoza",
      duration: "2h 10min",
    },
    {
      id: 3,
      player1: "Felipe Varas",
      player2: "Cristhian Vidal",
      score: "6-1, 6-2",
      date: "2024-01-13",
      winner: "Felipe Varas",
      duration: "1h 15min",
    },
    {
      id: 4,
      player1: "Daniel Vera",
      player2: "Rodrigo Arratia",
      score: "6-3, 6-2",
      date: "2024-01-12",
      winner: "Daniel Vera",
      duration: "1h 30min",
    },
  ]

  const liveMatches = [
    {
      id: 1,
      player1: "Franco Maura",
      player2: "Eduardo Farias",
      currentScore: "6-4, 3-2",
      set: "2do Set",
      court: "Cancha 3",
      startTime: "17:30",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Partidos</h2>
          <p className="text-muted-foreground">Gestión de partidos programados, en vivo y finalizados</p>
        </div>
        <Button onClick={scheduleMatch}>
          <Plus className="h-4 w-4 mr-2" />
          Programar Partido
        </Button>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upcoming">Próximos</TabsTrigger>
          <TabsTrigger value="live">En Vivo</TabsTrigger>
          <TabsTrigger value="recent">Recientes</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Partidos Programados</CardTitle>
              <CardDescription>Próximos encuentros de la liga</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingMatches.map((match) => (
                  <div key={match.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-2">
                      <p className="font-medium text-lg">
                        {match.player1} vs {match.player2}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {match.date}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {match.time}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {match.venue} - {match.court}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{match.status}</Badge>
                      <Button variant="outline" size="sm">
                        Editar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="live" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Partidos en Vivo</CardTitle>
              <CardDescription>Encuentros que se están jugando actualmente</CardDescription>
            </CardHeader>
            <CardContent>
              {liveMatches.length > 0 ? (
                <div className="space-y-4">
                  {liveMatches.map((match) => (
                    <div key={match.id} className="p-4 border rounded-lg bg-green-50 border-green-200">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <p className="font-medium text-lg">
                            {match.player1} vs {match.player2}
                          </p>
                          <p className="text-xl font-bold text-green-600">{match.currentScore}</p>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span>{match.set}</span>
                            <span>{match.court}</span>
                            <span>Inicio: {match.startTime}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className="bg-green-500">En Vivo</Badge>
                          <Button size="sm">Ver Detalles</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">No hay partidos en vivo en este momento</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Partidos Recientes</CardTitle>
              <CardDescription>Resultados de los últimos encuentros</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentMatches.map((match) => (
                  <div key={match.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-2">
                      <p className="font-medium text-lg">
                        {match.player1} vs {match.player2}
                      </p>
                      <p className="text-lg font-bold text-blue-600">{match.score}</p>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>
                          Ganador: <span className="font-medium text-green-600">{match.winner}</span>
                        </span>
                        <span>Duración: {match.duration}</span>
                        <span>{match.date}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">Finalizado</Badge>
                      <Button variant="outline" size="sm">
                        Ver Detalles
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
