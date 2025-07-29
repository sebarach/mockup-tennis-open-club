# Integración Supabase - Torneo de Tenis

Esta documentación describe la capa de abstracción completa para integrar Supabase en el proyecto de torneo de tenis.

## Arquitectura

La integración sigue una arquitectura en capas:

```
┌─────────────────────────────────────┐
│            UI Components            │
├─────────────────────────────────────┤
│          Custom Hooks              │
├─────────────────────────────────────┤
│        Services (Domain)           │
├─────────────────────────────────────┤
│        Repositories                │
├─────────────────────────────────────┤
│        Supabase Client             │
└─────────────────────────────────────┘
```

## Estructura de Archivos

```
lib/
├── supabase/
│   ├── client.ts           # Cliente singleton
│   └── database.types.ts   # Tipos autogenerados
├── types/
│   └── database.ts         # Tipos del dominio
├── repositories/
│   ├── base.repository.ts  # Repositorio base
│   ├── players.repository.ts
│   ├── tournaments.repository.ts
│   ├── matches.repository.ts
│   └── index.ts
├── services/
│   ├── players.service.ts
│   ├── tournaments.service.ts
│   └── matches.service.ts
└── utils/
    ├── error-handler.ts
    └── query-helpers.ts

hooks/
├── useSupabase.ts          # Hooks base
├── usePlayers.ts
├── useTournaments.ts
└── useMatches.ts

providers/
├── SupabaseProvider.tsx    # Provider principal
└── AuthProvider.tsx        # Manejo de autenticación
```

## Configuración Inicial

### 1. Variables de Entorno

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Configurar Providers

```tsx
// app/layout.tsx
import { SupabaseProvider } from '@/providers/SupabaseProvider'
import { AuthProvider } from '@/providers/AuthProvider'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        <SupabaseProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </SupabaseProvider>
      </body>
    </html>
  )
}
```

## Ejemplos de Uso

### 1. Consultar Jugadores

```tsx
import { usePlayers } from '@/hooks/usePlayers'

function PlayersPage() {
  const { data, isLoading, error } = usePlayers({
    page: 1,
    limit: 10,
    sortBy: 'ranking',
    sortOrder: 'asc',
    include: ['matches', 'tournaments']
  })

  if (isLoading) return <div>Cargando...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      {data?.data.map(player => (
        <div key={player.id}>
          <h3>{player.name}</h3>
          <p>Ranking: #{player.ranking}</p>
          <p>Puntos: {player.points}</p>
        </div>
      ))}
    </div>
  )
}
```

### 2. Crear Jugador

```tsx
import { useCreatePlayer } from '@/hooks/usePlayers'
import { useRouter } from 'next/navigation'

function AddPlayerForm() {
  const router = useRouter()
  const { mutate: createPlayer, isLoading } = useCreatePlayer({
    onSuccess: () => {
      router.push('/players')
    }
  })

  const handleSubmit = (data) => {
    createPlayer({
      name: data.name,
      email: data.email,
      phone: data.phone,
      playing_style: data.playingStyle,
      favorite_shot: data.favoriteShot
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Campos del formulario */}
    </form>
  )
}
```

### 3. Búsqueda en Tiempo Real

```tsx
import { useState } from 'react'
import { usePlayerSearch } from '@/hooks/usePlayers'
import { useRealtimeSubscription } from '@/hooks/useSupabase'

function PlayerSearchComponent() {
  const [searchTerm, setSearchTerm] = useState('')
  const { data: players, refetch } = usePlayerSearch(searchTerm)

  // Actualizar búsqueda cuando hay cambios en la tabla
  useRealtimeSubscription('players', () => {
    refetch()
  }, { enabled: searchTerm.length > 0 })

  return (
    <div>
      <input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Buscar jugadores..."
      />
      {players?.map(player => (
        <div key={player.id}>{player.name}</div>
      ))}
    </div>
  )
}
```

### 4. Manejo de Autenticación

```tsx
import { useAuth } from '@/providers/AuthProvider'

function LoginForm() {
  const { signIn, isLoading } = useAuth()

  const handleLogin = async (email: string, password: string) => {
    const { error } = await signIn(email, password)
    if (error) {
      // Error será manejado automáticamente por el error handler
      console.error('Login failed:', error)
    }
  }

  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      const formData = new FormData(e.target)
      handleLogin(
        formData.get('email'),
        formData.get('password')
      )
    }}>
      <input name="email" type="email" required />
      <input name="password" type="password" required />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Ingresando...' : 'Ingresar'}
      </button>
    </form>
  )
}
```

### 5. Proteger Rutas

```tsx
import { useRequireAuth } from '@/providers/AuthProvider'

function AdminPanel() {
  const { isLoading } = useRequireAuth('admin')

  if (isLoading) return <div>Verificando permisos...</div>

  return (
    <div>
      <h1>Panel de Administración</h1>
      {/* Contenido solo para admins */}
    </div>
  )
}
```

### 6. Operaciones Complejas con Servicios

```tsx
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { TournamentsService } from '@/lib/services/tournaments.service'

function TournamentManager() {
  const supabase = useSupabaseClient()
  const tournamentsService = new TournamentsService(supabase)

  const startTournament = async (tournamentId: string) => {
    try {
      const tournament = await tournamentsService.startTournament(tournamentId)
      console.log('Torneo iniciado:', tournament)
    } catch (error) {
      // Error manejado automáticamente
    }
  }

  const generateBracket = async (tournamentId: string, playerIds: string[]) => {
    try {
      await tournamentsService.generateBracket(tournamentId, playerIds)
      console.log('Bracket generado')
    } catch (error) {
      // Error manejado automáticamente
    }
  }

  return (
    <div>
      {/* UI para manejar torneos */}
    </div>
  )
}
```

### 7. Optimistic Updates

```tsx
import { useOptimisticUpdate } from '@/hooks/useSupabase'
import { useUpdatePlayer } from '@/hooks/usePlayers'

function PlayerProfile({ playerId }) {
  const { setOptimisticData, rollbackOptimisticData } = useOptimisticUpdate()
  const { mutate: updatePlayer } = useUpdatePlayer({
    onError: () => {
      // Rollback en caso de error
      rollbackOptimisticData(['players', playerId])
    }
  })

  const handleUpdateName = (newName: string) => {
    // Actualización optimista
    setOptimisticData(['players', playerId], (old) => ({
      ...old,
      name: newName
    }))

    // Enviar actualización al servidor
    updatePlayer({ id: playerId, data: { name: newName } })
  }

  return (
    <div>
      {/* UI del perfil */}
    </div>
  )
}
```

## Scripts SQL de Base de Datos

### Crear Tablas

```sql
-- Crear tabla de perfiles de usuario
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role TEXT CHECK (role IN ('admin', 'player', 'viewer')) DEFAULT 'viewer',
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de jugadores
CREATE TABLE players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  ranking INTEGER,
  points INTEGER DEFAULT 0,
  matches_played INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  win_rate DECIMAL DEFAULT 0,
  join_date DATE DEFAULT CURRENT_DATE,
  last_match DATE,
  favorite_shot TEXT,
  playing_style TEXT,
  achievements TEXT[] DEFAULT '{}',
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users
);

-- Crear tabla de torneos
CREATE TABLE tournaments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  max_players INTEGER NOT NULL CHECK (max_players >= 2),
  entry_fee DECIMAL,
  prize_pool DECIMAL,
  tournament_type TEXT CHECK (tournament_type IN ('single_elimination', 'round_robin', 'swiss')) NOT NULL,
  status TEXT CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')) DEFAULT 'upcoming',
  registration_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  rules TEXT,
  location TEXT,
  organizer_id UUID REFERENCES auth.users NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users
);

-- Resto de tablas...
```

### Row Level Security (RLS)

```sql
-- Habilitar RLS
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Políticas para jugadores
CREATE POLICY "Players are viewable by everyone" ON players
  FOR SELECT USING (is_active = true);

CREATE POLICY "Players can update their own data" ON players
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Admins can manage all players" ON players
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

## Best Practices

### 1. Manejo de Errores
- Todos los errores son manejados centralmente
- Mensajes user-friendly automáticos
- Logging automático en producción

### 2. Performance
- Queries optimizadas con índices
- Paginación en todas las listas
- Cache con React Query
- Subscripciones tiempo real selectivas

### 3. Seguridad
- Row Level Security habilitado
- Validación en cliente y servidor
- Roles y permisos granulares
- Sanitización de datos

### 4. TypeScript
- Tipos estrictos en toda la aplicación
- Tipos autogenerados desde Supabase
- Inferencia de tipos en hooks

### 5. Testing
- Mocks para Supabase client
- Tests unitarios para servicios
- Tests de integración para repositories

## Comandos Útiles

```bash
# Generar tipos de Supabase
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/supabase/database.types.ts

# Ejecutar migraciones
npx supabase db push

# Reset base de datos local
npx supabase db reset
```

Esta arquitectura proporciona una base sólida, escalable y mantenible para la integración con Supabase en tu proyecto de torneo de tenis.