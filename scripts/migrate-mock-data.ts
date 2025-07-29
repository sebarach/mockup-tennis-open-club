#!/usr/bin/env node

/**
 * Script para migrar datos mock a Supabase
 * 
 * Uso:
 * 1. Configurar variables de entorno
 * 2. npm install -g tsx (si no está instalado)
 * 3. npx tsx scripts/migrate-mock-data.ts
 */

import { createClient } from '@supabase/supabase-js'
import type { Database } from '../lib/supabase/database.types'

// Configuración
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Faltan variables de entorno:')
  console.error('   - NEXT_PUBLIC_SUPABASE_URL')
  console.error('   - SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)

// Datos mock de tu componente actual
const mockPlayers = [
  {
    name: "José Galaz",
    email: "jose.galaz@email.com",
    phone: "+56 9 1234 5678",
    ranking: 1,
    points: 245,
    matches_played: 999,
    wins: 999,
    losses: 0,
    win_rate: 100.0,
    join_date: "2023-03-15",
    last_match: "2024-01-14",
    favorite_shot: "Derecha",
    playing_style: "Agresivo",
    achievements: ["Campeón Copa Fin de Año 2023", "Mejor Racha 2023"],
  },
  {
    name: "Felipe Varas",
    email: "felipe.varas@email.com",
    phone: "+56 9 2345 6789",
    ranking: 2,
    points: 238,
    matches_played: 11,
    wins: 9,
    losses: 2,
    win_rate: 81.8,
    join_date: "2023-02-20",
    last_match: "2024-01-13",
    favorite_shot: "Revés",
    playing_style: "Defensivo",
    achievements: ["Campeón Liga Otoño 2023", "Finalista Copa Fin de Año 2023"],
  },
  {
    name: "Marco Espinoza",
    email: "marco.espinoza@email.com",
    phone: "+56 9 3456 7890",
    ranking: 3,
    points: 232,
    matches_played: 13,
    wins: 9,
    losses: 4,
    win_rate: 69.2,
    join_date: "2023-01-10",
    last_match: "2024-01-13",
    favorite_shot: "Saque",
    playing_style: "Completo",
    achievements: ["Campeón Torneo Invierno 2023", "Jugador Más Activo 2023"],
  },
  {
    name: "Daniel Vera",
    email: "daniel.vera@email.com",
    phone: "+56 9 4567 8901",
    ranking: 4,
    points: 225,
    matches_played: 10,
    wins: 8,
    losses: 2,
    win_rate: 80.0,
    join_date: "2023-04-05",
    last_match: "2024-01-12",
    favorite_shot: "Volea",
    playing_style: "Red",
    achievements: ["Finalista Torneo Invierno 2023", "Mayor Ascenso 2024"],
  },
  {
    name: "Cristhian Vidal",
    email: "cristhian.vidal@email.com",
    phone: "+56 9 5678 9012",
    ranking: 5,
    points: 218,
    matches_played: 12,
    wins: 8,
    losses: 4,
    win_rate: 66.7,
    join_date: "2023-05-12",
    last_match: "2024-01-11",
    favorite_shot: "Derecha",
    playing_style: "Consistente",
    achievements: ["Top 5 Consistente 2023"],
  },
  {
    name: "Nelson Molina",
    email: "nelson.molina@email.com",
    phone: "+56 9 6789 0123",
    ranking: 7,
    points: 195,
    matches_played: 10,
    wins: 6,
    losses: 4,
    win_rate: 60.0,
    join_date: "2023-06-18",
    last_match: "2024-01-14",
    favorite_shot: "Revés",
    playing_style: "Táctico",
    achievements: ["Mejor Deportividad 2023"],
  },
]

// Datos mock para canchas
const mockCourts = [
  {
    name: "Cancha Central",
    surface_type: "hard" as const,
    is_indoor: false,
    is_available: true,
    hourly_rate: 15000,
    description: "Cancha principal del club con iluminación LED",
    location: "Sector Norte"
  },
  {
    name: "Cancha Norte",
    surface_type: "clay" as const,
    is_indoor: false,
    is_available: true,
    hourly_rate: 12000,
    description: "Cancha de arcilla para entrenamientos",
    location: "Sector Norte"
  },
  {
    name: "Cancha Cubierta",
    surface_type: "synthetic" as const,
    is_indoor: true,
    is_available: true,
    hourly_rate: 20000,
    description: "Cancha techada para días lluviosos",
    location: "Sector Central"
  }
]

// Datos mock para torneos
const mockTournaments = [
  {
    name: "Copa de Verano 2024",
    description: "Torneo eliminatorio de verano para todos los niveles",
    start_date: "2024-02-15T10:00:00Z",
    end_date: "2024-02-20T18:00:00Z",
    max_players: 16,
    entry_fee: 25000,
    prize_pool: 300000,
    tournament_type: "single_elimination" as const,
    status: "upcoming" as const,
    registration_deadline: "2024-02-10T23:59:59Z",
    rules: "Torneo eliminatorio simple. Mejor de 3 sets. Tiebreak a 6-6.",
    location: "Club de Tenis Central"
  },
  {
    name: "Liga Interna 2024",
    description: "Liga round-robin entre todos los miembros activos",
    start_date: "2024-03-01T10:00:00Z",
    end_date: "2024-04-30T18:00:00Z",
    max_players: 12,
    entry_fee: 15000,
    prize_pool: 150000,
    tournament_type: "round_robin" as const,
    status: "upcoming" as const,
    registration_deadline: "2024-02-25T23:59:59Z",
    rules: "Todos contra todos. Mejor de 3 sets.",
    location: "Club de Tenis Central"
  }
]

async function migratePlayers() {
  console.log('🎾 Migrando jugadores...')
  
  for (const player of mockPlayers) {
    try {
      const { data, error } = await supabase
        .from('players')
        .insert({
          name: player.name,
          email: player.email,
          phone: player.phone,
          ranking: player.ranking,
          points: player.points,
          matches_played: player.matches_played,
          wins: player.wins,
          losses: player.losses,
          win_rate: player.win_rate,
          join_date: player.join_date,
          last_match: player.last_match || null,
          favorite_shot: player.favorite_shot,
          playing_style: player.playing_style,
          achievements: player.achievements,
          is_active: true
        })
        .select()
        .single()
      
      if (error) {
        if (error.code === '23505') {
          console.log(`⚠️  ${player.name} ya existe, saltando...`)
        } else {
          console.error(`❌ Error migrando ${player.name}:`, error.message)
        }
      } else {
        console.log(`✅ ${player.name} migrado exitosamente`)
      }
    } catch (err) {
      console.error(`💥 Error inesperado con ${player.name}:`, err)
    }
  }
}

async function migrateCourts() {
  console.log('🏟️  Migrando canchas...')
  
  for (const court of mockCourts) {
    try {
      const { data, error } = await supabase
        .from('courts')
        .insert(court)
        .select()
        .single()
      
      if (error) {
        if (error.code === '23505') {
          console.log(`⚠️  ${court.name} ya existe, saltando...`)
        } else {
          console.error(`❌ Error migrando ${court.name}:`, error.message)
        }
      } else {
        console.log(`✅ ${court.name} migrada exitosamente`)
      }
    } catch (err) {
      console.error(`💥 Error inesperado con ${court.name}:`, err)
    }
  }
}

async function migrateTournaments() {
  console.log('🏆 Migrando torneos...')
  
  // Necesitamos un organizer_id, creamos un usuario admin de ejemplo
  // En producción, esto debería ser un usuario real
  
  for (const tournament of mockTournaments) {
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .insert({
          ...tournament,
          organizer_id: '00000000-0000-0000-0000-000000000000' // UUID de ejemplo
        })
        .select()
        .single()
      
      if (error) {
        if (error.code === '23505') {
          console.log(`⚠️  ${tournament.name} ya existe, saltando...`)
        } else {
          console.error(`❌ Error migrando ${tournament.name}:`, error.message)
        }
      } else {
        console.log(`✅ ${tournament.name} migrado exitosamente`)
      }
    } catch (err) {
      console.error(`💥 Error inesperado con ${tournament.name}:`, err)
    }
  }
}

async function testConnection() {
  console.log('🔍 Probando conexión a Supabase...')
  
  try {
    const { data, error } = await supabase
      .from('players')
      .select('count(*)')
      .single()
    
    if (error) throw error
    
    console.log('✅ Conexión exitosa')
    return true
  } catch (err) {
    console.error('❌ Error de conexión:', err)
    return false
  }
}

async function showStats() {
  console.log('\n📊 Estadísticas finales:')
  
  try {
    const { count: playersCount } = await supabase
      .from('players')
      .select('*', { count: 'exact', head: true })
    
    const { count: courtsCount } = await supabase
      .from('courts')
      .select('*', { count: 'exact', head: true })
    
    const { count: tournamentsCount } = await supabase
      .from('tournaments')
      .select('*', { count: 'exact', head: true })
    
    console.log(`   👥 Jugadores: ${playersCount}`)
    console.log(`   🏟️  Canchas: ${courtsCount}`)
    console.log(`   🏆 Torneos: ${tournamentsCount}`)
    
  } catch (err) {
    console.error('Error obteniendo estadísticas:', err)
  }
}

// Función principal
async function main() {
  console.log('🚀 Iniciando migración de datos mock a Supabase\n')
  
  // Verificar conexión
  const connected = await testConnection()
  if (!connected) {
    console.error('💥 No se pudo conectar a Supabase. Verifica tu configuración.')
    process.exit(1)
  }
  
  console.log('')
  
  // Migrar datos
  await migratePlayers()
  console.log('')
  
  await migrateCourts()
  console.log('')
  
  await migrateTournaments()
  console.log('')
  
  // Mostrar estadísticas
  await showStats()
  
  console.log('\n🎉 ¡Migración completada!')
  console.log('\n💡 Próximos pasos:')
  console.log('   1. Verificar los datos en el dashboard de Supabase')
  console.log('   2. Actualizar tus componentes para usar los hooks de Supabase')
  console.log('   3. Probar la funcionalidad en tu aplicación')
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main().catch((err) => {
    console.error('💥 Error en la migración:', err)
    process.exit(1)
  })
}

export { main as migrateMockData }