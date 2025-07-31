# Tournament System Documentation

## Overview
Complete tournament management system with real-time data, player registration, and status management.

## Database Schema

### Core Tables
- `tournaments` - Tournament information and settings
- `playerss` - Player profiles and statistics  
- `tournament_registrations` - Many-to-many relationship between players and tournaments

### Tournament Registrations Table
```sql
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
  UNIQUE(tournament_id, player_id, is_active)
);
```

## API Functions

### Tournament Management (`tournamentsAPI`)
- `getAll()` - Get all tournaments
- `create(tournamentData)` - Create new tournament
- `update(id, data)` - Update tournament
- `getStats()` - Get tournament statistics

### Registration Management (`tournamentRegistrationsAPI`)
- `getPlayersByTournament(tournamentId)` - Get registered players
- `registerPlayers(tournamentId, playerIds)` - Register multiple players
- `unregisterPlayer(tournamentId, playerId)` - Remove player registration
- `getTournamentRegistrationStats(tournamentId)` - Get registration statistics
- `isPlayerRegistered(tournamentId, playerId)` - Check registration status

## Tournament States
- `upcoming` - Not started, accepting registrations
- `ongoing` - Tournament in progress
- `completed` - Tournament finished
- `cancelled` - Tournament cancelled

### State Transitions
- `upcoming` → `ongoing` (requires ≥2 players)
- `ongoing` → `completed` 
- Any state → `cancelled`

## UI Components

### Tournament Details Modal
- **Player registration display** with grid layout
- **Status editor** with dropdown and action buttons
- **Tournament information** in organized sections
- **Registration statistics** (registered/max/available)

### Player Registration Modal  
- **Registered players section** showing current participants
- **Multi-select dropdown** for adding new players
- **Capacity validation** and duplicate prevention
- **Real-time updates** after registration

### Dashboard Integration
- **Real tournament counts** from database
- **Clickable cards** for navigation
- **Loading states** and error handling

## Key Features

### Interactive Tournament Cards
- **Active tournaments**: Clickable cards open details modal
- **Upcoming tournaments**: Buttons for details and registration
- **Past tournaments**: View results functionality

### Smart Validation
- **Player capacity limits** enforced
- **Duplicate registration prevention**
- **Status transition rules** validated
- **Minimum player requirements** for tournament start

### Responsive Design
- **Mobile-first** approach with clamp() functions
- **Touch-friendly** interactions
- **Grid layouts** adapt to screen size
- **Hover effects** and transitions

## File Locations

### Main Components
- `components/tournaments-view.tsx` - Tournament management interface
- `components/dashboard-overview.tsx` - Dashboard with tournament stats

### API Layer
- `lib/supabase.js` - Tournament and registration APIs
- `lib/types/database.ts` - TypeScript interfaces

### Database Documentation
- `CLAUDE.md` - Complete database schemas and setup instructions

## Usage Examples

### Create Tournament
```javascript
const tournament = await tournamentsAPI.create({
  name: "Copa de Verano 2024",
  tournament_type: "single_elimination",
  max_players: 16,
  start_date: "2024-02-01",
  end_date: "2024-02-15",
  registration_deadline: "2024-01-25"
});
```

### Register Players
```javascript
await tournamentRegistrationsAPI.registerPlayers(
  tournamentId, 
  [playerId1, playerId2, playerId3]
);
```

### Change Tournament Status
```javascript
await tournamentsAPI.update(tournamentId, { status: 'ongoing' });
```

## Error Handling
- **Database constraints** properly handled with user-friendly messages
- **Validation errors** displayed in SweetAlert2 modals
- **Loading states** shown during API calls
- **Fallback data** for API failures

## Future Enhancements
- Tournament bracket generation
- Match scheduling within tournaments  
- Prize distribution tracking
- Tournament statistics and reporting