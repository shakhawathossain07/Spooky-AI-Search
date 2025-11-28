# Project Structure

## Directory Organization

```
spooky-ai-search/
├── src/                      # Source code
│   ├── components/           # React components
│   │   ├── AnimusEffect.tsx
│   │   ├── DynamicBackground.tsx
│   │   ├── EffectsShowcase.tsx
│   │   ├── LoadingScreen.tsx
│   │   ├── NightSkyBackground.tsx
│   │   └── SearchResults.tsx
│   ├── hooks/                # Custom React hooks (currently empty)
│   ├── lib/                  # Utilities and API clients
│   │   ├── search.ts         # Google Search & Gemini AI integration
│   │   └── supabase.ts       # Supabase client and auth helpers
│   ├── types/                # TypeScript type definitions
│   │   └── database.ts       # Supabase database types
│   ├── App.tsx               # Main application component
│   ├── main.tsx              # Application entry point
│   ├── index.css             # Global styles
│   └── vite-env.d.ts         # Vite environment types
├── netlify/
│   └── functions/            # Netlify Edge Functions (currently empty)
├── supabase/
│   ├── migrations/           # Database migration files
│   ├── config.toml           # Supabase configuration
│   └── *.md                  # Setup and documentation files
├── .kiro/                    # Kiro AI assistant configuration
│   ├── hooks/                # Agent hooks
│   ├── specs/                # Feature specifications
│   └── steering/             # AI steering rules
└── [config files]            # Root configuration files
```

## Component Architecture

### Main Components
- `App.tsx` - Root component with search UI and state management
- `SearchResults.tsx` - Enhanced search results display with AI summary, related questions, image gallery, and interactive result cards with save/share functionality
- `RelatedQuestions.tsx` - AI-generated follow-up questions component with interactive buttons
- `MusicPlayer.tsx` - Ambient meditation music player with play/pause controls, volume adjustment, and persistent preferences
- `NightSkyBackground.tsx` - Animated canvas background with owls, fireflies, stars, and moon
- `LoadingScreen.tsx` - Loading state UI with animated spinner
- `DynamicBackground.tsx` - Dynamic gradient background effects
- `EffectsShowcase.tsx` - Visual effects demonstration component
- `AnimusEffect.tsx` - Special animation effects overlay
- `ErrorBoundary.tsx` - React error boundary for graceful error handling with themed fallback UI

### Library Modules
- `lib/search.ts` - Search functionality integrating Google Programmable Search Engine (text, images, videos) and Gemini AI for summaries, with credibility scoring and performance tracking
- `lib/supabase.ts` - Database client and authentication helpers

### Component Features

**SearchResults Component:**
- AI Summary Card with gradient effects and live status
- Related Questions section with AI-generated follow-up questions
- Image Gallery with 8 related images in responsive grid
- Video Gallery support (ready for display with thumbnails and duration)
- Enhanced Result Cards with thumbnails, badges, and hover effects
- Credibility badges (High/Medium/Low Trust) with visual indicators
- Domain-specific badges for academic and government sources
- Interactive action buttons (Save to localStorage, Share via Web Share API, Copy link)
- Staggered fade-in animations
- New Search button with animated gradient

**RelatedQuestions Component:**
- Displays up to 5 AI-generated follow-up questions
- Interactive buttons that trigger new searches
- Gradient hover effects and smooth transitions
- Numbered list with arrow indicators

**Visual Design:**
- Gradient backgrounds with blur effects
- Glass-morphism styling (backdrop-blur)
- Smooth transitions and hover states
- Responsive grid layouts
- Custom animations (pulse, bounce, shimmer)

## File Naming Conventions
- React components: PascalCase (e.g., `SearchResults.tsx`)
- Utilities/libraries: camelCase (e.g., `search.ts`)
- Types: PascalCase (e.g., `database.ts`)
- Config files: kebab-case or standard names

## Code Organization Principles
- Components are self-contained in `src/components/`
- Shared utilities in `src/lib/`
- Type definitions in `src/types/`
- Custom hooks in `src/hooks/` (when needed)
- Serverless functions in `netlify/functions/` (when needed)
- Database migrations in `supabase/migrations/`

## Import Patterns
- Use relative imports for local files
- Environment variables via `import.meta.env.VITE_*`
- Supabase types imported from `src/types/database`
