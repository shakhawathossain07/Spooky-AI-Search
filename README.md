# 👻 Spooky AI Search

Next-generation AI-powered search engine built with React, TypeScript, Netlify, and Supabase.

<img width="959" height="412" alt="image" src="https://github.com/user-attachments/assets/e59e7b97-ee4b-4d29-b077-7cb82ba8690d" />

## Features

- 🔍 **AI-Powered Search**: Google Programmable Search Engine integration with real-time results
- 🧠 **AI Summaries**: Comprehensive analysis powered by Google Gemini 1.5 Flash
- 💡 **Related Questions**: AI-generated follow-up questions for deeper exploration
- 🖼️ **Image Search**: Related images displayed in an interactive gallery
- ✨ **Enhanced UI**: Beautiful gradient effects, animations, and hover interactions
- 🎨 **Spooky Theme**: Night sky background with flying owls and glowing fireflies
- 🎵 **Ambient Music**: Optional meditation music player with volume control
- 📚 **Study Mode**: Upload PDFs/lecture slides for AI-powered exam preparation
- 🌳 **Focus Timer**: Pomodoro-style timer with growing tree visualization - stay focused or your tree dies!
- 📊 **Rich Results**: Thumbnails, credibility badges, and interactive action buttons
- 🔒 **Trust Indicators**: Credibility scoring with High/Medium/Low trust badges
- 🎓 **Domain Badges**: Special indicators for academic and government sources
- 💾 **Save & Share**: Save results locally and share via native Web Share API
- ⚡ **Fast Performance**: Optimized for smooth animations and quick searches
- 🎯 **User-Friendly**: Intuitive interface with keyboard shortcuts

## Tech Stack

- **Frontend**: React 18 + TypeScript + TailwindCSS
- **Backend**: Netlify Edge Functions + Supabase
- **AI**: Google Gemini AI
- **Search**: Google Programmable Search Engine
- **Cache**: Upstash Redis (Optional)
- **Database**: PostgreSQL with pgvector

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- Supabase account
- Google Gemini API key
- Google Programmable Search Engine API key

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy `.env.example` to `.env` and fill in your API keys:
   ```bash
   cp .env.example .env
   ```

4. Set up Supabase locally:
   ```bash
   # On Windows (PowerShell)
   .\supabase\local-setup.ps1
   
   # On macOS/Linux
   ./supabase/local-setup.sh
   ```
   
   Or manually:
   ```bash
   supabase start
   supabase status
   ```
   
   Copy the API URL and anon key to your `.env` file.

5. Start the development server:
   ```bash
   npm run dev
   ```

### Deployment

Deploy to Netlify:
```bash
netlify deploy --prod
```

## Project Structure

```
spooky-ai-search/
├── src/
│   ├── components/
│   │   ├── SearchResults.tsx       # Enhanced search results display
│   │   ├── RelatedQuestions.tsx    # AI-generated follow-up questions
│   │   ├── StudyMode.tsx           # PDF upload & AI study assistant
│   │   ├── MusicPlayer.tsx         # Ambient music player
│   │   ├── FocusTimer.tsx          # Pomodoro timer with tree growth
│   │   ├── NightSkyBackground.tsx  # Animated night sky with owls
│   │   ├── LoadingScreen.tsx       # Loading animation
│   │   ├── DynamicBackground.tsx   # Dynamic gradient effects
│   │   ├── EffectsShowcase.tsx     # Visual effects demo
│   │   ├── AnimusEffect.tsx        # Special animations
│   │   └── ErrorBoundary.tsx       # React error boundary
│   ├── lib/
│   │   ├── search.ts               # Google Search & Gemini AI
│   │   └── supabase.ts             # Database client
│   ├── types/
│   │   └── database.ts             # TypeScript types
│   └── App.tsx                     # Main application
├── netlify/
│   └── functions/                  # Edge functions (planned)
└── supabase/
    ├── migrations/                 # Database migrations
    └── *.md                        # Setup documentation
```

## Key Components

### SearchResults Component
The `SearchResults` component provides a rich, interactive display of search results:

- **AI Summary Card**: Displays Gemini-generated analysis with gradient effects and live status indicator
- **Related Questions**: AI-generated follow-up questions for deeper exploration
- **Image Gallery**: Grid of related images with hover effects and source attribution
- **Search Results List**: Enhanced result cards with:
  - Thumbnails or numbered badges
  - Gradient hover effects
  - Credibility badges (High/Medium/Low Trust)
  - Domain-specific badges (.edu, .gov)
  - Interactive action buttons (Save, Share, Copy)
  - Publication date display
  - Smooth animations with staggered delays
- **New Search Button**: Animated button to start a fresh search

### StudyMode Component
AI-powered study assistant featuring:
- PDF upload and text extraction (up to 50 pages)
- AI topic identification (5-8 key topics per document)
- Automated research for each topic
- AI-generated summaries and curated resources
- Top 3 resources per topic with direct links
- Batch research capability for all topics

### MusicPlayer Component
Optional ambient music player featuring:
- Copyright-free meditation music
- Play/pause toggle with visual feedback
- Volume control slider (0-100%)
- Animated music wave visualization
- Persistent user preference via localStorage
- Glass-morphism design with purple accents

### FocusTimer Component
Pomodoro-style focus timer with gamification:
- Animated tree growth visualization on HTML5 canvas
- Tree states: seed (idle), growing, complete (with flowers), dead
- Tab/window focus detection - tree dies if user leaves!
- Configurable duration (5-120 minutes) with preset buttons
- Progress bar and percentage display
- Stats tracking via localStorage (trees grown, total focus time)
- Visual feedback with status overlays and animations
- "Give Up" option during active sessions

### NightSkyBackground Component
Animated canvas background featuring:
- 200 twinkling stars
- 5 flying owls with wing animations
- 40 glowing fireflies with light trails
- Detailed moon with craters
- Purple-blue night gradient

## UI Features

### Search Results Display
- **Gradient Effects**: Animated gradients on hover for visual feedback
- **Staggered Animations**: Results fade in with progressive delays
- **Interactive Elements**: Save, share, and copy link buttons with native Web Share API support
- **Responsive Design**: Adapts to different screen sizes
- **Image Thumbnails**: Automatic fallback for missing images
- **Credibility Scoring**: Algorithmic trust scores for each source (0-100)
- **Trust Indicators**: Visual badges showing High/Medium/Low trust levels
- **Domain Badges**: Special badges for academic (.edu) and government (.gov) sources
- **Source Metadata**: Publication dates and domain verification
- **Performance Metrics**: Search time tracking for optimization
- **Related Questions**: AI-generated follow-up questions for continued exploration
- **Local Storage**: Save functionality stores results in browser for later access

### Visual Effects
- **Glow Effects**: Pulsing glows around key elements
- **Smooth Transitions**: All interactions use smooth CSS transitions
- **Backdrop Blur**: Glass-morphism effects for modern look
- **Custom Animations**: Bounce, pulse, and shimmer effects

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Performance

- Optimized canvas animations (60 FPS)
- Lazy loading for images
- Efficient re-renders with React
- Smooth CSS transitions

## License

MIT
