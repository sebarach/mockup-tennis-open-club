# 🚀 Checklist de Implementación - Supabase Integration

Este documento proporciona un checklist paso a paso para habilitar la entrada de datos desde Supabase en tu proyecto de torneo de tenis.

## 📋 Pre-requisitos

- [ ] Proyecto de Supabase creado
- [ ] Node.js 18+ instalado
- [ ] Acceso al dashboard de Supabase

---

## 🔧 Paso 1: Instalación de Dependencias

```bash
# Instalar dependencias principales
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs @supabase/auth-helpers-react

# Instalar React Query y dependencias UI
npm install @tanstack/react-query @tanstack/react-query-devtools

# Instalar librerías para notificaciones y utilidades
npm install sonner date-fns

# Instalar dependencias de desarrollo (si usas TypeScript)
npm install -D @types/node
```

---

## 🌐 Paso 2: Configuración de Variables de Entorno

Crear archivo `.env.local` en la raíz del proyecto:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Optional: Para funciones de servidor
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**⚠️ Importante:**

- [ ] Obtener URL y keys desde el dashboard de Supabase
- [ ] No commitear `.env.local` al repositorio
- [ ] Agregar `.env.local` al `.gitignore`

---

## 🗄️ Paso 3: Crear Base de Datos en Supabase

### 3.1 Ejecutar SQL para Crear Tablas

En el SQL Editor de Supabase, ejecutar este script:

```sql
-- 1. Crear tabla de perfiles de usuario
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role TEXT CHECK (role IN ('admin', 'player', 'viewer')) DEFAULT 'viewer',
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Crear tabla de jugadores
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
  win_rate DECIMAL(5,2) DEFAULT 0,
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

-- 3. Crear tabla de torneos
CREATE TABLE tournaments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  max_players INTEGER NOT NULL CHECK (max_players >= 2 AND max_players <= 128),
  entry_fee DECIMAL(10,2),
  prize_pool DECIMAL(10,2),
  tournament_type TEXT CHECK (tournament_type IN ('single_elimination', 'round_robin', 'swiss')) NOT NULL,
  status TEXT CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')) DEFAULT 'upcoming',
  registration_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  rules TEXT,
  location TEXT,
  organizer_id UUID REFERENCES auth.users NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users,
  CONSTRAINT valid_dates CHECK (end_date > start_date AND registration_deadline < start_date)
);

-- 4. Crear tabla de canchas
CREATE TABLE courts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  surface_type TEXT CHECK (surface_type IN ('clay', 'hard', 'grass', 'synthetic')) NOT NULL,
  is_indoor BOOLEAN DEFAULT FALSE,
  is_available BOOLEAN DEFAULT TRUE,
  hourly_rate DECIMAL(8,2),
  description TEXT,
  image_url TEXT,
  location TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users
);

-- 5. Crear tabla de partidos
CREATE TABLE matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE NOT NULL,
  player1_id UUID REFERENCES players(id) NOT NULL,
  player2_id UUID REFERENCES players(id) NOT NULL,
  court_id UUID REFERENCES courts(id),
  scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
  actual_start_time TIMESTAMP WITH TIME ZONE,
  actual_end_time TIMESTAMP WITH TIME ZONE,
  status TEXT CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'postponed')) DEFAULT 'scheduled',
  round INTEGER NOT NULL DEFAULT 1,
  match_number INTEGER NOT NULL,
  winner_id UUID REFERENCES players(id),
  score TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users,
  CONSTRAINT different_players CHECK (player1_id != player2_id),
  CONSTRAINT valid_winner CHECK (winner_id IN (player1_id, player2_id) OR winner_id IS NULL),
  CONSTRAINT valid_times CHECK (actual_end_time IS NULL OR actual_end_time > actual_start_time)
);

-- 6. Crear tabla de puntajes
CREATE TABLE scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE NOT NULL,
  set_number INTEGER NOT NULL CHECK (set_number > 0),
  player1_games INTEGER NOT NULL DEFAULT 0 CHECK (player1_games >= 0),
  player2_games INTEGER NOT NULL DEFAULT 0 CHECK (player2_games >= 0),
  player1_tiebreak INTEGER CHECK (player1_tiebreak >= 0),
  player2_tiebreak INTEGER CHECK (player2_tiebreak >= 0),
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(match_id, set_number)
);

-- 7. Crear tabla de rankings
CREATE TABLE rankings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  position INTEGER NOT NULL CHECK (position > 0),
  points INTEGER NOT NULL DEFAULT 0,
  matches_played INTEGER NOT NULL DEFAULT 0,
  wins INTEGER NOT NULL DEFAULT 0,
  losses INTEGER NOT NULL DEFAULT 0,
  win_percentage DECIMAL(5,2) DEFAULT 0,
  ranking_type TEXT CHECK (ranking_type IN ('overall', 'tournament', 'seasonal')) NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE,
  is_current BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3.2 Crear Índices para Performance

```sql
-- Índices para optimizar consultas frecuentes
CREATE INDEX idx_players_email ON players(email);
CREATE INDEX idx_players_ranking ON players(ranking) WHERE ranking IS NOT NULL;
CREATE INDEX idx_players_active ON players(is_active);
CREATE INDEX idx_tournaments_status ON tournaments(status);
CREATE INDEX idx_tournaments_dates ON tournaments(start_date, end_date);
CREATE INDEX idx_matches_tournament ON matches(tournament_id);
CREATE INDEX idx_matches_players ON matches(player1_id, player2_id);
CREATE INDEX idx_matches_date ON matches(scheduled_date);
CREATE INDEX idx_scores_match ON scores(match_id);
CREATE INDEX idx_rankings_player ON rankings(player_id);
CREATE INDEX idx_rankings_current ON rankings(is_current) WHERE is_current = TRUE;
```

### 3.3 Configurar Row Level Security (RLS)

```sql
-- Habilitar RLS en todas las tablas
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE courts ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE rankings ENABLE ROW LEVEL SECURITY;

-- Políticas para user_profiles
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Políticas para players (públicas para lectura, admins para escritura)
CREATE POLICY "Players are viewable by everyone" ON players
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage all players" ON players
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Políticas para tournaments
CREATE POLICY "Tournaments are viewable by everyone" ON tournaments
  FOR SELECT USING (is_active = true);

CREATE POLICY "Organizers can manage their tournaments" ON tournaments
  FOR ALL USING (organizer_id = auth.uid());

CREATE POLICY "Admins can manage all tournaments" ON tournaments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Políticas para courts
CREATE POLICY "Courts are viewable by everyone" ON courts
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage courts" ON courts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Políticas para matches
CREATE POLICY "Matches are viewable by everyone" ON matches
  FOR SELECT USING (is_active = true);

CREATE POLICY "Players can view their matches" ON matches
  FOR SELECT USING (
    player1_id IN (
      SELECT id FROM players WHERE created_by = auth.uid()
    ) OR
    player2_id IN (
      SELECT id FROM players WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all matches" ON matches
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Políticas para scores y rankings (similares)
-- ... continuar con el resto de políticas
```

### 3.4 Crear Storage Bucket para Avatares

En el dashboard de Supabase > Storage:

1. [ ] Crear bucket llamado `player-avatars`
2. [ ] Configurar como público
3. [ ] Configurar políticas de acceso:

```sql
-- Política para subir avatares
CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'player-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Política para ver avatares
CREATE POLICY "Avatars are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'player-avatars');
```

---

## 🔧 Paso 4: Generar Tipos TypeScript

```bash
# Instalar CLI de Supabase
npm install -g supabase

# Generar tipos (reemplaza YOUR_PROJECT_ID)
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/supabase/database.types.ts
```

**⚠️ Nota:** Los tipos ya están en el código, pero debes regenerarlos cuando cambies la estructura de la DB.

---

## 🏗️ Paso 5: Configurar Providers en tu App

### 5.1 Actualizar `app/layout.tsx`

```tsx
import "./globals.css";
import { SupabaseProvider } from "@/providers/SupabaseProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <SupabaseProvider>
          <AuthProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange>
              {children}
              <Toaster position="top-right" />
            </ThemeProvider>
          </AuthProvider>
        </SupabaseProvider>
      </body>
    </html>
  );
}
```

### 5.2 Crear Middleware para Auth (opcional)

```tsx
// middleware.ts
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Proteger rutas de admin
  if (req.nextUrl.pathname.startsWith("/admin") && !session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return res;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
```

---

## 🔄 Paso 6: Migrar Datos Existentes (Mock → Supabase)

### 6.1 Script de Migración de Jugadores

```typescript
// scripts/migrate-players.ts
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Usar service role para bypass RLS
);

// Datos mock actuales de tu components/player-profiles.tsx
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
  // ... resto de jugadores
];

async function migratePlayers() {
  console.log("🚀 Iniciando migración de jugadores...");

  for (const player of mockPlayers) {
    try {
      const { error } = await supabase.from("players").insert({
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
        last_match: player.last_match,
        favorite_shot: player.favorite_shot,
        playing_style: player.playing_style,
        achievements: player.achievements,
        is_active: true,
      });

      if (error) {
        console.error(`Error migrando ${player.name}:`, error);
      } else {
        console.log(`✅ ${player.name} migrado exitosamente`);
      }
    } catch (err) {
      console.error(`Error inesperado con ${player.name}:`, err);
    }
  }

  console.log("🎉 Migración completada!");
}

// Ejecutar: npx tsx scripts/migrate-players.ts
migratePlayers();
```

---

## 🔧 Paso 7: Actualizar Componentes Existentes

### 7.1 Actualizar `components/player-profiles.tsx`

```tsx
// Reemplazar el estado mock con hooks de Supabase
import {
  usePlayers,
  useCreatePlayer,
  useUpdatePlayer,
  useDeletePlayer,
} from "@/hooks/usePlayers";

export function PlayerProfiles() {
  const [searchTerm, setSearchTerm] = useState("");

  // Reemplazar useState con hook de Supabase
  const {
    data: playersResponse,
    isLoading,
    error,
  } = usePlayers({
    search: searchTerm,
    page: 1,
    limit: 50,
    sortBy: "ranking",
    sortOrder: "asc",
  });

  const { mutate: createPlayer } = useCreatePlayer({
    onSuccess: () => {
      // Toast de éxito se maneja automáticamente
    },
  });

  const { mutate: updatePlayer } = useUpdatePlayer();

  // Actualizar función addPlayer para usar Supabase
  const addPlayer = async () => {
    const { value: formValues } = await Swal.fire({
      // ... mismo código del modal
      preConfirm: () => {
        // ... mismas validaciones
        return { name, email, phone, playingStyle, favoriteShot };
      },
    });

    if (formValues) {
      createPlayer({
        name: formValues.name,
        email: formValues.email,
        phone: formValues.phone,
        playing_style: formValues.playingStyle,
        favorite_shot: formValues.favoriteShot,
        points: 0,
        matches_played: 0,
        wins: 0,
        losses: 0,
        win_rate: 0,
        achievements: [],
      });
    }
  };

  // Actualizar función editPlayer
  const editPlayer = async (player: Player) => {
    // ... mismo código del modal
    if (formValues) {
      updatePlayer({
        id: player.id,
        data: {
          name: formValues.name,
          email: formValues.email,
          phone: formValues.phone,
          playing_style: formValues.playingStyle,
          favorite_shot: formValues.favoriteShot,
        },
      });
    }
  };

  const players = playersResponse?.data || [];

  // Resto del componente igual...
  if (isLoading) return <div>Cargando jugadores...</div>;
  if (error) return <div>Error cargando jugadores</div>;

  // ... resto del JSX igual
}
```

---

## 🧪 Paso 8: Testing de la Integración

### 8.1 Verificar Conexión

```tsx
// pages/test-supabase.tsx (crear temporalmente)
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";

export default function TestSupabase() {
  const supabase = useSupabaseClient();
  const [players, setPlayers] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function testConnection() {
      try {
        const { data, error } = await supabase
          .from("players")
          .select("*")
          .limit(5);

        if (error) throw error;
        setPlayers(data);
        console.log("✅ Conexión exitosa:", data);
      } catch (err) {
        setError(err.message);
        console.error("❌ Error de conexión:", err);
      }
    }

    testConnection();
  }, [supabase]);

  return (
    <div className="p-8">
      <h1>Test Supabase Connection</h1>
      {error && <div className="text-red-500">Error: {error}</div>}
      <pre>{JSON.stringify(players, null, 2)}</pre>
    </div>
  );
}
```

### 8.2 Test de CRUD Operations

```tsx
// Probar crear, leer, actualizar, eliminar jugadores
const testCRUD = async () => {
  try {
    // CREATE
    const { data: newPlayer } = await supabase
      .from("players")
      .insert({ name: "Test Player", email: "test@test.com" })
      .select()
      .single();

    console.log("✅ Player created:", newPlayer);

    // READ
    const { data: players } = await supabase
      .from("players")
      .select("*")
      .eq("email", "test@test.com");

    console.log("✅ Players found:", players);

    // UPDATE
    const { data: updatedPlayer } = await supabase
      .from("players")
      .update({ name: "Updated Test Player" })
      .eq("id", newPlayer.id)
      .select()
      .single();

    console.log("✅ Player updated:", updatedPlayer);

    // DELETE
    await supabase.from("players").delete().eq("id", newPlayer.id);

    console.log("✅ Player deleted");
  } catch (error) {
    console.error("❌ CRUD Test failed:", error);
  }
};
```

---

## 🚀 Paso 9: Deploy y Configuración de Producción

### 9.1 Variables de Entorno en Vercel/Netlify

```bash
# En tu plataforma de deploy, configurar:
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 9.2 Configurar Auth Redirects en Supabase

En Dashboard > Authentication > URL Configuration:

- Site URL: `https://your-domain.com`
- Redirect URLs: `https://your-domain.com/auth/callback`

---

## ✅ Checklist Final de Verificación

- [ ] Base de datos creada con todas las tablas
- [ ] RLS configurado correctamente
- [ ] Storage bucket para avatares creado
- [ ] Variables de entorno configuradas
- [ ] Dependencias instaladas
- [ ] Providers configurados en layout
- [ ] Tipos TypeScript generados
- [ ] Componentes actualizados para usar Supabase
- [ ] Datos mock migrados
- [ ] Tests de conexión exitosos
- [ ] Deploy configurado

---

## 🔧 Comandos de Mantenimiento

```bash
# Generar nuevos tipos después de cambios en DB
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/supabase/database.types.ts

# Reset local database (si usas Supabase local)
npx supabase db reset

# Backup de datos
npx supabase db dump --data-only > backup.sql
```

---

## 🆘 Troubleshooting Común

### Error: "Invalid JWT"

- Verificar que las variables de entorno estén correctas
- Regenerar las keys en el dashboard de Supabase

### Error: "Row Level Security"

- Verificar que las políticas RLS estén configuradas
- Usar service role key para operaciones admin

### Error: "Network Error"

- Verificar conexión a internet
- Verificar URL de Supabase

### Queries Lentas

- Agregar índices necesarios
- Optimizar queries con .select() específicos

---

Con este checklist detallado, tienes todo lo necesario para habilitar la entrada de datos desde Supabase de manera ordenada y sin errores. ¿Te gustaría que profundice en algún paso específico?
