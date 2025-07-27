# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run Next.js linting

## Project Architecture

This is a Tennis League Dashboard built with Next.js 15 and React 19, generated from v0.dev. The application follows a component-based architecture with a sidebar navigation system.

### Key Architecture Patterns

**Main Application Structure:**
- Single-page application with view switching via state management
- `app/page.tsx` contains the main dashboard with `activeView` state that controls which component renders
- Navigation handled through `AppSidebar` component which updates the active view

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