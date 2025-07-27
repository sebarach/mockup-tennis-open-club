import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin, Plus } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function MatchesView() {
  const upcomingMatches = [
    {
      id: 1,
      player1: "Daniel Vera",
      player2: "Diego Amaya",
      date: "2024-01-15",
      time: "18:00",
      court: "Cancha 1",
      status: "Programado",
    },
    {
      id: 2,
      player1: "Roberto Medina",
      player2: "Danilo Milla",
      date: "2024-01-15",
      time: "19:30",
      court: "Cancha 2",
      status: "Programado",
    },
    {
      id: 3,
      player1: "Ignacio Cid",
      player2: "Sebastian Sepulveda",
      date: "2024-01-16",
      time: "17:00",
      court: "Cancha 1",
      status: "Programado",
    },
  ]

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
        <Button>
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
                          {match.court}
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
