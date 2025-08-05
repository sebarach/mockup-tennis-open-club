# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `pnpm dev` - Start development server (Next.js 15)
- `pnpm build` - Build for production  
- `pnpm start` - Start production server
- `pnpm lint` - Run Next.js linting

**Note:** This project uses pnpm as the package manager (not npm or yarn).

## Project Architecture

This is a Tennis League Dashboard built with Next.js 15 and React 19, generated from v0.dev. The application follows a layered architecture with repository pattern, service layer, and component-based UI.

### Architecture Layers

**Presentation Layer:**
- Single-page application with view switching via state management
- `app/page.tsx` contains the main dashboard with `activeView` state that controls which component renders
- Navigation handled through `AppSidebar` component which updates the active view
- State management is handled locally with React useState (no external state management library)

**Service Layer:**
- `lib/services/` - Business logic and data orchestration
- `PlayersService` - Handles player operations, validation, and stat calculations
- `TournamentsService` - Tournament management logic
- Services coordinate between repositories and handle business rules

**Data Access Layer:**
- `lib/repositories/` - Data access abstraction over Supabase
- `BaseRepository` - Generic CRUD operations with pagination, search, and filtering
- `PlayersRepository`, `MatchesRepository`, `TournamentsRepository` - Domain-specific data operations
- Repository pattern provides consistent API for database operations

**Component Organization:**
- `components/` - Main application components (dashboard views, sidebar)
- `components/ui/` - Shadcn/ui reusable UI components
- `hooks/` - Custom React hooks for data fetching and state management
- `providers/` - React context providers (Auth, Supabase)

**Utility Layer:**
- `lib/utils.ts` - General utility functions (primarily `cn()` for class merging)
- `lib/utils/error-handler.ts` - Centralized error handling
- `lib/utils/query-helpers.ts` - Database query utilities
- `lib/types/database.ts` - TypeScript type definitions

### Data Flow Pattern
1. Components call custom hooks (`usePlayers`, `useSupabase`)
2. Hooks interact with service layer for business logic
3. Services coordinate with repositories for data access
4. Repositories handle Supabase client operations
5. Error handling is centralized through `handleSupabaseError`

### Styling System
- Tailwind CSS with shadcn/ui design system
- CSS variables for theming in `app/globals.css`
- Dark mode support via `next-themes`

### UI Framework
- Shadcn/ui components built on Radix UI primitives
- Lucide React for icons
- Recharts for data visualization
- React Hook Form with Zod validation for forms
- SweetAlert2 for alerts/modals
- Date handling with date-fns and react-datepicker

### View Components
The dashboard uses a view-switching pattern where these main components render based on navigation:
- `DashboardOverview` - Main dashboard view
- `PlayersRanking` - Player rankings and statistics
- `MatchesView` - Match scheduling and results
- `TournamentsView` - Tournament management
- `PlayerProfiles` - Individual player profiles

### Configuration Notes
- TypeScript with strict mode enabled and `@/*` path aliases
- ESLint and TypeScript errors ignored during builds (configured for v0.dev compatibility)
- Images unoptimized for deployment flexibility
- Webpack optimizations for CSS chunking and caching with custom splitChunks configuration
- Security headers configured in `next.config.mjs` (X-Frame-Options, X-Content-Type-Options)
- Tailwind CSS with HSL-based custom CSS variables for theming
- Development optimizations: build activity indicator disabled, custom watch options

### v0.dev Integration
This project syncs automatically with v0.dev deployments. Changes made in v0.dev are pushed to this repository and deployed via Vercel.

## Database Integration

### Supabase Setup
The application uses Supabase as its backend database. Two Supabase client configurations exist:

**Primary Client:** `lib/supabase.js` - Simple client for components with helper functions
**Typed Client:** `lib/supabase/client.ts` - TypeScript-typed client for repositories

### Database Schema

#### Main Tables
- **`playerss`** - Player information (name, email, ranking, stats, etc.)
- **`tournaments`** - Tournament details (name, dates, type, prize pool, etc.)

#### Relationship Tables
- **`tournament_registrations`** - Many-to-many relationship between players and tournaments

#### Tournament Registrations Table Schema
```sql
-- Tabla intermedia para inscripciones de jugadores en torneos
CREATE TABLE tournament_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES playerss(id) ON DELETE CASCADE,
  registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'registered' CHECK (status IN ('registered', 'withdrawn', 'disqualified')),
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  -- Evitar duplicados: un jugador solo puede estar inscrito una vez por torneo
  UNIQUE(tournament_id, player_id, is_active)
);

-- Índices para mejorar rendimiento
CREATE INDEX idx_tournament_registrations_tournament_id ON tournament_registrations(tournament_id);
CREATE INDEX idx_tournament_registrations_player_id ON tournament_registrations(player_id);
CREATE INDEX idx_tournament_registrations_status ON tournament_registrations(status);
CREATE INDEX idx_tournament_registrations_active ON tournament_registrations(is_active);

-- RLS (Row Level Security) policies
ALTER TABLE tournament_registrations ENABLE ROW LEVEL SECURITY;

-- Permitir lectura pública
CREATE POLICY "Allow public read tournament_registrations" ON tournament_registrations
FOR SELECT USING (true);

-- Permitir inserción pública (para inscripciones)
CREATE POLICY "Allow public insert tournament_registrations" ON tournament_registrations
FOR INSERT WITH CHECK (true);

-- Permitir actualización pública (para cambios de estado)
CREATE POLICY "Allow public update tournament_registrations" ON tournament_registrations
FOR UPDATE USING (true);

-- Permitir eliminación pública (para desinscripciones)
CREATE POLICY "Allow public delete tournament_registrations" ON tournament_registrations
FOR DELETE USING (true);
```

### Environment Variables
Required environment variables for Supabase integration:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Database Schema
The main table is `playerss` with these key columns:
- Standard player fields (name, email, phone, etc.)
- Tennis-specific fields (favorite_shot, playing_style)
- Statistics fields (points, wins, losses, matches_played, win_rate, ranking)
- Avatar fields (avatar_url, avatar_path)
- Metadata fields (is_active, created_at, updated_at)

**Required columns for avatar functionality:**
```sql
-- Add avatar columns to playerss table
ALTER TABLE playerss 
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS avatar_path TEXT;
```

**Required tournaments table:**
```sql
-- Create tournaments table
CREATE TABLE IF NOT EXISTS tournaments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,  
  registration_deadline DATE NOT NULL,
  max_players INTEGER NOT NULL DEFAULT 16,
  entry_fee DECIMAL(10,2) DEFAULT 0,
  prize_pool DECIMAL(10,2) DEFAULT 0,
  tournament_type TEXT NOT NULL CHECK (tournament_type IN ('single_elimination', 'round_robin', 'swiss')),
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  location TEXT,
  rules TEXT,
  organizer_id TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_tournaments_status ON tournaments(status);
CREATE INDEX IF NOT EXISTS idx_tournaments_start_date ON tournaments(start_date);
CREATE INDEX IF NOT EXISTS idx_tournaments_active ON tournaments(is_active);
```

### Repository Pattern Implementation
All database operations follow the repository pattern:

**BaseRepository Features:**
- Generic CRUD operations with TypeScript typing
- Pagination, search, and filtering
- Soft delete with `is_active` flag
- Batch operations (createMany, updateMany, deleteMany)
- Real-time subscriptions via Supabase channels
- Centralized error handling via `handleSupabaseError`

**Specific Repositories:**
- `PlayersRepository` - Player-specific queries including email validation and avatar management
- `MatchesRepository` - Match operations and head-to-head statistics
- `TournamentsRepository` - Tournament management

### Error Handling Pattern
All database operations use centralized error handling:
- `handleSupabaseError` function processes Supabase errors
- Custom error messages for common scenarios (duplicate email, not found, etc.)
- Service layer adds business logic validation on top of database errors

### Supabase Storage Setup
For player avatar images, the project uses Supabase Storage:

#### 1. Create Storage Bucket
1. Go to **Storage** in Supabase dashboard
2. Click **"New bucket"**
3. Configure bucket:
   - **Name:** `player-images`
   - **Public bucket:** ✅ **CHECKED** (enables public access to images)
   - **File size limit:** `5MB`
   - **Allowed MIME types:** `image/*`

#### 2. Configure Storage Policies
After creating the bucket, set up Row Level Security policies via the Supabase Dashboard:

1. Go to **Storage > player-images bucket > Policies**
2. Create these 4 policies:

**Policy 1: Allow Public Read**
- **Policy name:** `Allow public read`
- **Allowed operation:** `SELECT`
- **Target roles:** `public`
- **USING expression:** `bucket_id = 'player-images'`

**Policy 2: Allow Public Insert**
- **Policy name:** `Allow public insert`
- **Allowed operation:** `INSERT` 
- **Target roles:** `public`
- **WITH CHECK expression:** `bucket_id = 'player-images'`

**Policy 3: Allow Public Update**
- **Policy name:** `Allow public update`
- **Allowed operation:** `UPDATE`
- **Target roles:** `public`
- **USING expression:** `bucket_id = 'player-images'`

**Policy 4: Allow Public Delete**
- **Policy name:** `Allow public delete`
- **Allowed operation:** `DELETE`
- **Target roles:** `public`
- **USING expression:** `bucket_id = 'player-images'`

#### 3. Environment Variables
Ensure these variables are set in your environment:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Storage API Usage
The `lib/supabase.js` file contains the storage API functions:
- `storageAPI.uploadAvatar()` - Upload player avatar images
- `storageAPI.deleteAvatar()` - Remove old avatar images
- `storageAPI.getPublicUrl()` - Get public URLs for displaying images

**Important Notes:**
- Images are stored in the `avatars/` folder within the bucket
- File naming convention: `{playerId}-{timestamp}.{extension}`
- Maximum file size: 5MB
- Supported formats: JPG, PNG, GIF
- Old avatars are automatically deleted when updating player images

## Key Implementation Patterns

### Error Handling
All errors are processed through the centralized `handleSupabaseError` function in `lib/supabase/client.ts`. Services add business logic validation on top of repository-level database errors.

### Data Validation
- React Hook Form with Zod schema validation for forms
- Business logic validation in service layer (email validation, duplicate checking)
- TypeScript strict mode for compile-time type safety

### State Management
- Local React useState for component state (no external state management)
- View switching controlled by `activeView` state in main `app/page.tsx`
- Custom hooks (`usePlayers`, `useSupabase`) for data fetching and state

### File Organization
- `components/ui/` - Shadcn/ui reusable components
- `components/` - Application-specific view components  
- `lib/repositories/` - Data access layer with base repository pattern
- `lib/services/` - Business logic layer
- `hooks/` - Custom React hooks
- `providers/` - React context providers (Auth, Supabase)

## Development Guidelines

### Code Quality Requirements
When making changes to the codebase, always:
1. Run `pnpm lint` after making changes to ensure code quality
2. Follow the existing TypeScript patterns and repository architecture
3. Use the established error handling via `handleSupabaseError`
4. Maintain consistency with the service layer pattern
5. Ensure all database operations go through repositories
6. Validate business logic in service classes before database operations

### Important Development Notes
- **Package Manager**: This project uses **pnpm** exclusively - never use npm or yarn
- **File Management**: Always prefer editing existing files over creating new ones
- **Documentation**: Only create documentation files (*.md) when explicitly requested
- **Database Changes**: Always use the repository pattern - never direct Supabase client calls in components
- **View Navigation**: All view switching is controlled by `activeView` state in `app/page.tsx`
- **Error Handling**: All errors must flow through the centralized `handleSupabaseError` function