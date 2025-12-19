# Tech Stack

## Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 6
- **Styling**: TailwindCSS 3.4 with custom theme
- **Type Safety**: TypeScript 5.6 with strict mode enabled

## Backend & Services
- **Hosting**: Netlify (with Edge Functions support)
- **Database**: Supabase (PostgreSQL with pgvector)
- **AI**: Google Gemini 2.0 Flash API
- **Search**: Google Programmable Search Engine API
- **Cache**: Upstash Redis (optional)

## Key Dependencies
- `@supabase/supabase-js` - Database and auth client
- `react` & `react-dom` - UI framework
- `vite` - Build tool and dev server
- `tailwindcss` - Utility-first CSS framework

## Development Tools
- ESLint with TypeScript support
- PostCSS with Autoprefixer
- TypeScript compiler

## Common Commands

### Development
```bash
npm run dev          # Start dev server on port 3000
npm run build        # Build for production (TypeScript + Vite)
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Deployment
```bash
netlify deploy --prod    # Deploy to Netlify production
```

### Supabase Local Development
```bash
# Windows
.\supabase\local-setup.ps1

# macOS/Linux
./supabase/local-setup.sh

# Manual
supabase start
supabase status
```

## Environment Variables
Required variables in `.env`:
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- `VITE_GEMINI_API_KEY` - Google Gemini API key
- `VITE_GOOGLE_SEARCH_API_KEY` - Google Custom Search API key

## Build Configuration
- **Target**: ES2020
- **Module**: ESNext with bundler resolution
- **Output**: `dist/` directory with sourcemaps
- **Dev Server**: Port 3000
- **Node Version**: 20+
