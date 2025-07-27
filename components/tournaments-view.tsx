import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trophy, Calendar, Users, Award, Plus } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export function TournamentsView() {
  const activeTournaments = [
    {
      id: 1,
      name: "Copa de Verano 2024",
      type: "Eliminación Directa",
      participants: 16,
      startDate: "2024-01-10",
      endDate: "2024-01-20",
      status: "En Progreso",
      progress: 65,
      currentRound: "Cuartos de Final",
      prize: "$500.000",
    },
    {
      id: 2,
      name: "Liga Regular - Enero",
      type: "Round Robin",
      participants: 24,
      startDate: "2024-01-05",
      endDate: "2024-01-25",
      status: "En Progreso",
      progress: 45,
      currentRound: "Fase de Grupos",
      prize: "$300.000",
    },
  ]

  const upcomingTournaments = [
    {
      id: 3,
      name: "Torneo de Primavera",
      type: "Eliminación Directa",
      participants: 32,
      startDate: "2024-02-01",
      registrationDeadline: "2024-01-25",
      prize: "$750.000",
    },
  ]

  const pastTournaments = [
    {
      id: 1,
      name: "Copa de Fin de Año 2023",
      winner: "José Galaz",
      runnerUp: "Felipe Varas",
      participants: 20,
      date: "2023-12-15",
      prize: "$400.000",
    },
    {
      id: 2,
      name: "Torneo de Invierno 2023",
      winner: "Marco Espinoza",
      runnerUp: "Daniel Vera",
      participants: 16,
      date: "2023-11-20",
      prize: "$350.000",
    },
    {
      id: 3,
      name: "Liga de Otoño 2023",
      winner: "Felipe Varas",
      runnerUp: "José Galaz",
      participants: 28,
      date: "2023-10-30",
      prize: "$600.000",
    },
  ]

  const tournamentStats = [
    { label: "Torneos Totales", value: "12", icon: Trophy },
    { label: "Participantes Únicos", value: "45", icon: Users },
    { label: "Premios Entregados", value: "$4.2M", icon: Award },
    { label: "Partidos Jugados", value: "156", icon: Calendar },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Torneos</h2>
          <p className="text-muted-foreground">Gestión de torneos activos, próximos y histórico</p>
        </div>
        <Button>
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
            {activeTournaments.map((tournament) => (
              <div key={tournament.id} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">{tournament.name}</h3>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>{tournament.type}</span>
                      <span>{tournament.participants} participantes</span>
                      <span>
                        {tournament.startDate} - {tournament.endDate}
                      </span>
                    </div>
                    <p className="text-sm">
                      <span className="font-medium">Premio:</span> {tournament.prize}
                    </p>
                  </div>
                  <Badge className="bg-green-500">{tournament.status}</Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progreso: {tournament.currentRound}</span>
                    <span>{tournament.progress}%</span>
                  </div>
                  <Progress value={tournament.progress} className="h-2" />
                </div>

                <div className="flex justify-end space-x-2 mt-4">
                  <Button variant="outline" size="sm">
                    Ver Bracket
                  </Button>
                  <Button size="sm">Gestionar</Button>
                </div>
              </div>
            ))}
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
              {upcomingTournaments.map((tournament) => (
                <div key={tournament.id} className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">{tournament.name}</h3>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>
                      {tournament.type} • {tournament.participants} participantes
                    </p>
                    <p>Inicio: {tournament.startDate}</p>
                    <p>Inscripciones hasta: {tournament.registrationDeadline}</p>
                    <p className="font-medium text-foreground">Premio: {tournament.prize}</p>
                  </div>
                  <div className="flex justify-end space-x-2 mt-3">
                    <Button variant="outline" size="sm">
                      Ver Detalles
                    </Button>
                    <Button size="sm">Inscribir Jugadores</Button>
                  </div>
                </div>
              ))}
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
              {pastTournaments.map((tournament) => (
                <div key={tournament.id} className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">{tournament.name}</h3>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="text-muted-foreground">Campeón:</span>{" "}
                      <span className="font-medium text-yellow-600">{tournament.winner}</span>
                    </p>
                    <p>
                      <span className="text-muted-foreground">Finalista:</span>{" "}
                      <span className="font-medium text-gray-600">{tournament.runnerUp}</span>
                    </p>
                    <p className="text-muted-foreground">
                      {tournament.participants} participantes • {tournament.date}
                    </p>
                    <p className="font-medium">Premio: {tournament.prize}</p>
                  </div>
                  <div className="flex justify-end mt-3">
                    <Button variant="outline" size="sm">
                      Ver Resultados
                    </Button>
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
