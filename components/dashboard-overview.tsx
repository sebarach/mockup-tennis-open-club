import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Users, Calendar, TrendingUp, Clock, MapPin } from "lucide-react"
import { useState, useEffect } from "react"
import { playersAPI } from "@/lib/supabase"

interface DashboardOverviewProps {
  setActiveView?: (view: string) => void
}

export function DashboardOverview({ setActiveView }: DashboardOverviewProps) {
  const [playersCount, setPlayersCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadPlayersCount = async () => {
      try {
        const players = await playersAPI.getAll()
        setPlayersCount(players.length)
      } catch (error) {
        console.error('Error loading players count:', error)
        setPlayersCount(0)
      } finally {
        setLoading(false)
      }
    }
    
    loadPlayersCount()
  }, [])
  const stats = [
    {
      title: "Jugadores Activos",
      value: loading ? "..." : playersCount.toString(),
      description: "Jugadores registrados",
      icon: Users,
      trend: loading ? "Cargando..." : `${playersCount} total`,
      clickable: true,
      onClick: () => setActiveView?.('players')
    },
    {
      title: "Partidos Jugados",
      value: "156",
      description: "Total de partidos",
      icon: Calendar,
      trend: "+12 esta semana",
    },
    {
      title: "Torneos Activos",
      value: "3",
      description: "En progreso",
      icon: Trophy,
      trend: "2 finalizados",
    },
    {
      title: "Promedio Sets",
      value: "2.4",
      description: "Por partido",
      icon: TrendingUp,
      trend: "↑ 0.2 vs mes anterior",
    },
  ]

  const recentMatches = [
    { player1: "José Galaz", player2: "Nelson Molina", score: "6-2, 6-4", date: "Hoy", status: "Finalizado" },
    { player1: "Marco Espinoza", player2: "Kabir Manzul", score: "6-4, 4-6, 6-3", date: "Ayer", status: "Finalizado" },
    { player1: "Felipe Varas", player2: "Cristhian Vidal", score: "6-1, 6-2", date: "2 días", status: "Finalizado" },
    { player1: "Daniel Vera", player2: "Diego Amaya", score: "En progreso", date: "Hoy", status: "En juego" },
  ]

  const topPlayers = [
    { name: "José Galaz", points: 245, matches: 12, wins: 10 },
    { name: "Felipe Varas", points: 238, matches: 11, wins: 9 },
    { name: "Marco Espinoza", points: 232, matches: 13, wins: 9 },
    { name: "Daniel Vera", points: 225, matches: 10, wins: 8 },
    { name: "Cristhian Vidal", points: 218, matches: 12, wins: 8 },
  ]

  const upcomingMatches = [
    {
      id: 1,
      player1: "Daniel Vera",
      player2: "Diego Amaya",
      date: "2024-01-15",
      time: "18:00",
      venue: "Amador Donoso",
      court: "Cancha 1",
      status: "Programado"
    },
    {
      id: 2,
      player1: "Roberto Medina",
      player2: "Danilo Milla",
      date: "2024-01-15",
      time: "19:30",
      venue: "Laurita Vicuña",
      court: "Cancha 2",
      status: "Programado"
    },
    {
      id: 3,
      player1: "Ignacio Cid",
      player2: "Sebastian Sepulveda",
      date: "2024-01-16",
      time: "17:00",
      venue: "Amador Donoso",
      court: "Cancha 1",
      status: "Programado"
    },
    {
      id: 4,
      player1: "Franco Maura",
      player2: "Eduardo Farias",
      date: "2024-01-16",
      time: "20:00",
      venue: "Laurita Vicuña",
      court: "Cancha A",
      status: "Programado"
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Resumen general de la liga de tenis</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card 
            key={index} 
            className={stat.clickable ? "cursor-pointer hover:shadow-lg transition-shadow hover:bg-accent/50" : ""}
            onClick={stat.onClick}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
              <p className="text-xs text-green-600 mt-1">{stat.trend}</p>
              {stat.clickable && (
                <p className="text-xs text-blue-600 mt-1 font-medium">Click para ver detalles →</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Recent Matches */}
        <Card>
          <CardHeader>
            <CardTitle>Partidos Recientes</CardTitle>
            <CardDescription>Últimos resultados y partidos en progreso</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentMatches.map((match, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      {match.player1} vs {match.player2}
                    </p>
                    <p className="text-xs text-muted-foreground">{match.score}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <Badge variant={match.status === "En juego" ? "default" : "secondary"}>{match.status}</Badge>
                    <p className="text-xs text-muted-foreground">{match.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Matches */}
        <Card>
          <CardHeader>
            <CardTitle>Próximos Partidos</CardTitle>
            <CardDescription>Partidos programados para los próximos días</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingMatches.map((match) => (
                <div key={match.id} className="p-3 border rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">
                      {match.player1} vs {match.player2}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {match.date}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {match.time}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3 mr-1" />
                        {match.venue} - {match.court}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {match.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Players */}
        <Card>
          <CardHeader>
            <CardTitle>Top 5 Jugadores</CardTitle>
            <CardDescription>Ranking actual por puntos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPlayers.map((player, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-green-500 flex items-center justify-center text-white text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{player.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {player.wins}/{player.matches} victorias
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{player.points}</p>
                    <p className="text-xs text-muted-foreground">puntos</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
