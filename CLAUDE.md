# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `pnpm dev` - Start development server (Next.js 15)
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run Next.js linting

**Note:** This project uses pnpm as the package manager (not npm or yarn).

## Project Architecture

This is a Tennis League Dashboard built with Next.js 15 and React 19, generated from v0.dev. The application follows a component-based architecture with a sidebar navigation system.

### Key Architecture Patterns

**Main Application Structure:**
- Single-page application with view switching via state management
- `app/page.tsx` contains the main dashboard with `activeView` state that controls which component renders
- Navigation handled through `AppSidebar` component which updates the active view
- State management is handled locally with React useState (no external state management library)

**Component Organization:**
- `components/` - Main application components (dashboard views, sidebar)
- `components/ui/` - Shadcn/ui reusable UI components
- `lib/utils.ts` - Utility functions (primarily `cn()` for class merging)
- `hooks/` - Custom React hooks

**Styling System:**
- Tailwind CSS with shadcn/ui design system
- CSS variables for theming in `app/globals.css`
- Dark mode support via `next-themes`

**UI Framework:**
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
- TypeScript with strict mode enabled
- ESLint and TypeScript errors ignored during builds (configured for v0.dev compatibility)
- Images unoptimized for deployment flexibility
- Uses `@/*` path aliases for clean imports

### v0.dev Integration
This project syncs automatically with v0.dev deployments. Changes made in v0.dev are pushed to this repository and deployed via Vercel.

## Supabase Configuration

### Database Setup
The application uses Supabase as its backend database. The main table is `playerss` with the following structure:

**Required columns for avatar functionality:**
```sql
-- Add avatar columns to playerss table
ALTER TABLE playerss 
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS avatar_path TEXT;
```

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