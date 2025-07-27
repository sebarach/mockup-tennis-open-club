import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Trophy, Medal, Award } from "lucide-react"

export function PlayersRanking() {
  const players = [
    {
      name: "José Galaz",
      points: 245,
      matches: 12,
      wins: 10,
      losses: 2,
      winRate: 83.3,
      setsWon: 22,
      setsLost: 8,
      position: 1,
      change: 0,
    },
    {
      name: "Felipe Varas",
      points: 238,
      matches: 11,
      wins: 9,
      losses: 2,
      winRate: 81.8,
      setsWon: 20,
      setsLost: 7,
      position: 2,
      change: 1,
    },
    {
      name: "Marco Espinoza",
      points: 232,
      matches: 13,
      wins: 9,
      losses: 4,
      winRate: 69.2,
      setsWon: 21,
      setsLost: 12,
      position: 3,
      change: -1,
    },
    {
      name: "Daniel Vera",
      points: 225,
      matches: 10,
      wins: 8,
      losses: 2,
      winRate: 80.0,
      setsWon: 18,
      setsLost: 6,
      position: 4,
      change: 2,
    },
    {
      name: "Cristhian Vidal",
      points: 218,
      matches: 12,
      wins: 8,
      losses: 4,
      winRate: 66.7,
      setsWon: 19,
      setsLost: 11,
      position: 5,
      change: 0,
    },
    {
      name: "Kabir Manzul",
      points: 210,
      matches: 11,
      wins: 7,
      losses: 4,
      winRate: 63.6,
      setsWon: 16,
      setsLost: 12,
      position: 6,
      change: -2,
    },
    {
      name: "Nelson Molina",
      points: 195,
      matches: 10,
      wins: 6,
      losses: 4,
      winRate: 60.0,
      setsWon: 14,
      setsLost: 11,
      position: 7,
      change: 1,
    },
    {
      name: "Diego Amaya",
      points: 188,
      matches: 9,
      wins: 5,
      losses: 4,
      winRate: 55.6,
      setsWon: 12,
      setsLost: 10,
      position: 8,
      change: -1,
    },
  ]

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />
      default:
        return <span className="text-lg font-bold text-muted-foreground">#{position}</span>
    }
  }

  const getChangeIndicator = (change: number) => {
    if (change > 0) return <span className="text-green-600 text-xs">↑{change}</span>
    if (change < 0) return <span className="text-red-600 text-xs">↓{Math.abs(change)}</span>
    return <span className="text-gray-400 text-xs">-</span>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Ranking de Jugadores</h2>
        <p className="text-muted-foreground">Clasificación actual basada en puntos y rendimiento</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tabla de Posiciones</CardTitle>
          <CardDescription>Ranking actualizado con estadísticas detalladas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {players.map((player, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {getRankIcon(player.position)}
                    {getChangeIndicator(player.change)}
                  </div>

                  <Avatar>
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-green-500 text-white">
                      {player.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>

                  <div>
                    <p className="font-medium">{player.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {player.wins}V - {player.losses}D ({player.winRate.toFixed(1)}%)
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-6 text-sm">
                  <div className="text-center">
                    <p className="font-bold text-lg">{player.points}</p>
                    <p className="text-muted-foreground">Puntos</p>
                  </div>

                  <div className="text-center">
                    <p className="font-medium">{player.matches}</p>
                    <p className="text-muted-foreground">Partidos</p>
                  </div>

                  <div className="text-center">
                    <p className="font-medium">
                      {player.setsWon}/{player.setsLost}
                    </p>
                    <p className="text-muted-foreground">Sets</p>
                  </div>

                  <Badge
                    variant={player.winRate >= 70 ? "default" : player.winRate >= 50 ? "secondary" : "destructive"}
                  >
                    {player.winRate.toFixed(1)}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Mejor Racha</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-2xl font-bold">José Galaz</p>
              <p className="text-sm text-muted-foreground">7 victorias consecutivas</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Más Activo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-2xl font-bold">Marco Espinoza</p>
              <p className="text-sm text-muted-foreground">13 partidos jugados</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Mayor Ascenso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-2xl font-bold">Daniel Vera</p>
              <p className="text-sm text-muted-foreground">+2 posiciones</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
