# Scripts para Package.json

Agrega estos scripts a tu `package.json` para facilitar el trabajo con Supabase:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    
    "supabase:types": "npx supabase gen types typescript --project-id $SUPABASE_PROJECT_ID > lib/supabase/database.types.ts",
    "supabase:migrate": "npx tsx scripts/migrate-mock-data.ts",
    "supabase:reset": "npx supabase db reset",
    "supabase:status": "npx supabase status",
    
    "db:migrate": "npm run supabase:migrate",
    "db:types": "npm run supabase:types",
    
    "test:supabase": "npx tsx scripts/test-connection.ts"
  },
  "devDependencies": {
    "@types/node": "^22",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "next": "15.4.4",
    "postcss": "^8.5",
    "tailwindcss": "^3.4.17",
    "typescript": "^5",
    "tsx": "^4.7.0"
  },
  "dependencies": {
    // ... tus dependencias existentes
    "@supabase/supabase-js": "^2.38.0",
    "@supabase/auth-helpers-nextjs": "^0.8.7",
    "@supabase/auth-helpers-react": "^0.4.2",
    "@tanstack/react-query": "^5.17.0",
    "@tanstack/react-query-devtools": "^5.17.0",
    "sonner": "^1.3.1",
    "date-fns": "^3.0.0"
  }
}
```

## Variables de Entorno para Scripts

Crea un archivo `.env.local` con:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_PROJECT_ID=your-project-id

# Para scripts de desarrollo
NODE_ENV=development
```

## Uso de los Scripts

```bash
# Instalar dependencias adicionales
npm install tsx @supabase/supabase-js @supabase/auth-helpers-nextjs @supabase/auth-helpers-react @tanstack/react-query sonner

# Generar tipos TypeScript desde Supabase
npm run db:types

# Migrar datos mock a Supabase
npm run db:migrate

# Probar conexión a Supabase
npm run test:supabase
```