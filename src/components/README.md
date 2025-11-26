# Components Documentation

## SearchResults Component

**File**: `SearchResults.tsx`

### Purpose
Displays search results with AI-generated summaries, related images, and enhanced interactive UI.

### Props
```typescript
interface SearchResultsProps {
  searchData: SearchResponse;      // Search results from lib/search.ts
  onNewSearch: () => void;          // Callback to reset and start new search
  onQuestionClick?: (question: string) => void;  // Optional callback for related question clicks
}

interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  displayLink: string;
  image?: string;
  thumbnail?: string;
  publishedDate?: string;        // ISO date string when content was published
  credibilityScore?: number;     // Trust score 0-100 based on domain authority
}

interface SearchResponse {
  results: SearchResult[];
  aiSummary: string;
  query: string;
  totalResults: number;
  images?: Array<{...}>;
  videos?: Array<{...}>;         // Related video results with thumbnails and duration
  relatedQuestions?: string[];   // AI-generated follow-up questions
  searchTime?: number;           // Search execution time in milliseconds
}
```

### Features

#### 1. AI Summary Card
- Displays Gemini-generated analysis
- Gradient background with blur effects
- Live status indicator
- Source count and query display
- Search time performance metrics

#### 2. Related Questions Section
- AI-generated follow-up questions (up to 5)
- Interactive buttons that trigger new searches
- Gradient hover effects
- Numbered list with arrow indicators
- Integrates with RelatedQuestions component

#### 3. Image Gallery
- Grid layout (2 columns on mobile, 4 on desktop)
- Up to 8 related images
- Hover effects with image zoom
- Source attribution overlay
- Fallback for broken images
- Opens full image in new tab

#### 4. Search Results List
- Enhanced result cards with:
  - Thumbnails (when available) or numbered badges
  - Gradient hover effects
  - Title with gradient on hover
  - Domain with verified badge
  - Snippet preview (3 lines max)
  - Credibility score badges (High/Medium/Low Trust with icons ✓/~/?)
  - Publication date display (when available)
  - Domain-specific badges (.edu Academic, .gov Government)
  - Interactive action buttons:
    - **Save**: Stores result to localStorage with timestamp
    - **Share**: Uses native Web Share API (fallback to copy)
    - **Copy**: Copies link to clipboard
  - "Read more" link with animated arrow
- Staggered fade-in animations (50ms delay per item)
- Smooth scale transform on hover
- Search time display in AI summary section

#### 5. New Search Button
- Animated gradient background
- Shine effect on hover
- Scale animation
- Resets search state

### Styling

**Color Scheme:**
- Purple (`#8b5cf6`) - Primary accent
- Blue (`#3b82f6`) - Secondary accent
- Cyan (`#06b6d4`) - Tertiary accent
- Pink (`#ec4899`) - Highlight accent
- Gray (`#1f2937`, `#111827`) - Backgrounds

**Effects:**
- Backdrop blur for glass-morphism
- Gradient borders with low opacity
- Pulsing glow effects
- Smooth transitions (300-500ms)
- Staggered animations

### Usage Example

```tsx
import SearchResults from './components/SearchResults';
import { performSearch } from './lib/search';

function App() {
  const [searchData, setSearchData] = useState(null);
  const [query, setQuery] = useState('');
  
  const handleSearch = async (searchQuery: string) => {
    const results = await performSearch(searchQuery);
    setSearchData(results);
  };
  
  const handleNewSearch = () => {
    setSearchData(null);
    setQuery('');
  };
  
  const handleQuestionClick = (question: string) => {
    setQuery(question);
    handleSearch(question);
  };
  
  return (
    <div>
      {searchData && (
        <SearchResults 
          searchData={searchData} 
          onNewSearch={handleNewSearch}
          onQuestionClick={handleQuestionClick}
        />
      )}
    </div>
  );
}
```

### Helper Functions

#### getCredibilityBadge(score: number)
Returns badge configuration based on credibility score:
- **80-100**: Green badge, "High Trust", ✓ icon
- **60-79**: Yellow badge, "Medium Trust", ~ icon
- **0-59**: Gray badge, "Low Trust", ? icon

#### handleCopyLink(link: string, e: React.MouseEvent)
Copies URL to clipboard and shows alert notification.

#### handleShare(result: SearchResult, e: React.MouseEvent)
Uses native Web Share API if available, falls back to copy link.

#### handleSave(result: SearchResult, e: React.MouseEvent)
Saves result to localStorage with timestamp in `savedResults` array.

### Dependencies
- `../lib/search` - SearchResponse and SearchResult types
- `./RelatedQuestions` - Related questions component
- TailwindCSS - Styling utilities
- React - Component framework
- Web Share API - Native sharing (with fallback)
- localStorage - Client-side result storage

### Performance Considerations
- Images use lazy loading (browser native)
- Animations use CSS transforms (GPU accelerated)
- Staggered animations prevent layout thrashing
- Fallback images prevent broken image icons
- localStorage operations are synchronous but minimal
- Web Share API is async with proper error handling

---

## NightSkyBackground Component

**File**: `NightSkyBackground.tsx`

### Purpose
Animated canvas background with night sky theme featuring stars, owls, fireflies, and moon.

### Features
- 200 twinkling stars with varying brightness
- 5 flying owls with wing animations and glowing eyes
- 40 fireflies with pulsing light and trails
- Detailed moon with craters and glow
- Purple-blue gradient sky
- 60 FPS animations

### Usage
```tsx
import NightSkyBackground from './components/NightSkyBackground';

function App() {
  return (
    <div>
      <NightSkyBackground />
      {/* Your content */}
    </div>
  );
}
```

---

## LoadingScreen Component

**File**: `LoadingScreen.tsx`

### Purpose
Full-screen loading animation with rotating rings and particles.

### Props
```typescript
interface LoadingScreenProps {
  message?: string;  // Default: "Loading..."
}
```

### Usage
```tsx
import LoadingScreen from './components/LoadingScreen';

{isLoading && <LoadingScreen message="Searching..." />}
```

---

## Other Components

### MusicPlayer
**File**: `MusicPlayer.tsx`

#### Purpose
Provides ambient meditation music with play/pause controls and volume adjustment.

#### Features
- Copyright-free ambient meditation music
- Play/pause toggle with visual feedback
- Volume control slider (0-100%)
- Animated music wave visualization when playing
- Persistent user preference (localStorage)
- Hover-activated volume control
- Smooth animations and transitions

#### Props
No props required - fully self-contained component.

#### Usage
```tsx
import MusicPlayer from './components/MusicPlayer';

function App() {
  return (
    <div>
      <MusicPlayer />
      {/* Your content */}
    </div>
  );
}
```

#### Features Detail
- **Auto-save Preference**: Remembers user's music on/off preference in localStorage
- **Volume Control**: Adjustable volume slider (appears on hover when music is playing)
- **Visual Feedback**: Animated music waves and pulsing play icon
- **Tooltips**: Informative hover tooltips for better UX
- **Responsive**: Fixed position in top-right corner, doesn't interfere with content

#### Styling
- Glass-morphism design with backdrop blur
- Purple accent colors matching app theme
- Smooth transitions and hover effects
- Animated music wave bars when playing

---

### DynamicBackground
Gradient background overlay with radial effects.

### EffectsShowcase
Demonstration component showing available visual effects.

### AnimusEffect
Animated border effects for the application.

