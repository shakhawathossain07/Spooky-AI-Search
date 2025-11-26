# Implementation Guide: Making Search Extraordinary

## Quick Start - Implement These 5 Features Today

### 1. Streaming AI Response (30 minutes)

**Why**: Users see results faster, feels more responsive

```typescript
// src/lib/search.ts - Add streaming support
export async function generateAISummaryStream(
  query: string,
  results: SearchResult[],
  onChunk: (text: string) => void
): Promise<string> {
  const context = results
    .slice(0, 8)
    .map((r, i) => `Source ${i + 1}: ${r.title}\n${r.snippet}`)
    .join('\n\n');
  
  const prompt = `Analyze these search results for "${query}" and provide a comprehensive answer.\n\n${context}`;
  
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:streamGenerateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 500 }
      })
    }
  );

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  let fullText = '';

  while (true) {
    const { done, value } = await reader!.read();
    if (done) break;
    
    const chunk = decoder.decode(value);
    const lines = chunk.split('\n').filter(line => line.trim());
    
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = JSON.parse(line.slice(6));
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        fullText += text;
        onChunk(text); // Update UI incrementally
      }
    }
  }

  return fullText;
}
```

```typescript
// src/App.tsx - Use streaming
const [aiSummary, setAiSummary] = useState('');

const handleSearch = async () => {
  setIsSearching(true);
  setAiSummary(''); // Clear previous
  
  const results = await getGoogleSearchResults(query);
  
  // Show results immediately
  setSearchData({ results, aiSummary: '', query, totalResults: results.length });
  
  // Stream AI summary
  await generateAISummaryStream(query, results, (chunk) => {
    setAiSummary(prev => prev + chunk);
  });
  
  setIsSearching(false);
};
```

---

### 2. Related Questions (20 minutes)

**Why**: Helps users explore topics deeper

```typescript
// src/lib/search.ts
export async function generateRelatedQuestions(
  query: string,
  results: SearchResult[]
): Promise<string[]> {
  const prompt = `Based on the search query "${query}", generate 5 related follow-up questions that users might want to ask. Return only the questions, one per line.`;
  
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.8, maxOutputTokens: 200 }
      })
    }
  );
  
  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  
  return text
    .split('\n')
    .filter(q => q.trim())
    .map(q => q.replace(/^\d+\.\s*/, '').trim())
    .slice(0, 5);
}
```

```typescript
// src/components/SearchResults.tsx - Add related questions section
{searchData.relatedQuestions && searchData.relatedQuestions.length > 0 && (
  <div className="bg-gray-900/70 backdrop-blur-xl rounded-2xl border border-blue-500/30 p-6">
    <h3 className="text-xl font-bold text-gray-200 mb-4 flex items-center gap-2">
      <span>💡</span>
      <span>Related Questions</span>
    </h3>
    <div className="space-y-2">
      {searchData.relatedQuestions.map((question, idx) => (
        <button
          key={idx}
          onClick={() => onNewSearch(question)}
          className="w-full text-left px-4 py-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg border border-gray-700/50 hover:border-blue-500/50 transition-all group"
        >
          <span className="text-gray-300 group-hover:text-blue-400">
            {question}
          </span>
        </button>
      ))}
    </div>
  </div>
)}
```

---

### 3. Source Timestamps (15 minutes)

**Why**: Users want to know if information is current

```typescript
// src/lib/search.ts - Extract publish dates
async function getGoogleSearchResults(query: string): Promise<SearchResult[]> {
  // ... existing code ...
  
  return data.items.slice(0, 10).map((item: any) => ({
    title: item.title || 'Untitled',
    link: item.link || '#',
    snippet: item.snippet || 'No description available',
    displayLink: item.displayLink || new URL(item.link).hostname,
    image: item.pagemap?.cse_image?.[0]?.src,
    thumbnail: item.pagemap?.cse_thumbnail?.[0]?.src,
    publishedDate: item.pagemap?.metatags?.[0]?.['article:published_time'] || 
                    item.pagemap?.metatags?.[0]?.['og:updated_time'] ||
                    null,
  }));
}
```

```typescript
// src/components/SearchResults.tsx - Display timestamps
import { formatDistanceToNow } from 'date-fns';

{result.publishedDate && (
  <span className="text-xs text-gray-500 flex items-center gap-1">
    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
    </svg>
    {formatDistanceToNow(new Date(result.publishedDate), { addSuffix: true })}
  </span>
)}
```

---

### 4. Quick Actions (25 minutes)

**Why**: Users want to save, share, and interact with results

```typescript
// src/components/SearchResults.tsx - Add action handlers
const handleCopyLink = (link: string) => {
  navigator.clipboard.writeText(link);
  // Show toast notification
  alert('Link copied to clipboard!');
};

const handleShare = async (result: SearchResult) => {
  if (navigator.share) {
    await navigator.share({
      title: result.title,
      text: result.snippet,
      url: result.link,
    });
  } else {
    handleCopyLink(result.link);
  }
};

const handleSave = async (result: SearchResult) => {
  // Save to localStorage or Supabase
  const saved = JSON.parse(localStorage.getItem('savedResults') || '[]');
  saved.push({ ...result, savedAt: new Date().toISOString() });
  localStorage.setItem('savedResults', JSON.stringify(saved));
  alert('Result saved!');
};

// In the result card
<div className="flex items-center gap-4 text-xs text-gray-500">
  <button 
    onClick={(e) => { e.preventDefault(); handleSave(result); }}
    className="flex items-center gap-1 hover:text-purple-400 transition-colors"
  >
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
    </svg>
    Save
  </button>
  <button 
    onClick={(e) => { e.preventDefault(); handleShare(result); }}
    className="flex items-center gap-1 hover:text-cyan-400 transition-colors"
  >
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
    </svg>
    Share
  </button>
  <button 
    onClick={(e) => { e.preventDefault(); handleCopyLink(result.link); }}
    className="flex items-center gap-1 hover:text-blue-400 transition-colors"
  >
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
    Copy
  </button>
</div>
```

---

### 5. Keyboard Shortcuts (20 minutes)

**Why**: Power users love keyboard navigation

```typescript
// src/App.tsx - Add keyboard shortcuts
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Cmd/Ctrl + K: Focus search
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      document.querySelector<HTMLInputElement>('input[type="text"]')?.focus();
    }
    
    // Escape: Clear search
    if (e.key === 'Escape') {
      handleNewSearch();
    }
    
    // Cmd/Ctrl + Enter: Search
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };
  
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [query]);

// Add keyboard hints to UI
<div className="text-center mt-4">
  <p className="text-xs text-gray-500">
    <kbd className="px-2 py-1 bg-gray-800 rounded border border-gray-700">⌘K</kbd> to focus • 
    <kbd className="px-2 py-1 bg-gray-800 rounded border border-gray-700 ml-2">⌘↵</kbd> to search • 
    <kbd className="px-2 py-1 bg-gray-800 rounded border border-gray-700 ml-2">Esc</kbd> to clear
  </p>
</div>
```

---

## Advanced Features (Next Week)

### 6. Multi-Perspective AI (2 hours)

**Why**: Get balanced views from multiple AI models

```typescript
// src/lib/ai-synthesis.ts
export interface Perspective {
  source: 'gemini' | 'claude' | 'gpt4';
  summary: string;
  keyPoints: string[];
  confidence: number;
}

export async function getMultiPerspective(
  query: string,
  results: SearchResult[]
): Promise<{
  consensus: string;
  perspectives: Perspective[];
  controversies: string[];
}> {
  const [gemini, claude] = await Promise.all([
    generateGeminiSummary(query, results),
    generateClaudeSummary(query, results),
  ]);
  
  // Synthesize perspectives
  const synthesis = await synthesizePerspectives(query, [gemini, claude]);
  
  return synthesis;
}

async function generateClaudeSummary(
  query: string,
  results: SearchResult[]
): Promise<Perspective> {
  // Use Claude API (requires API key)
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': import.meta.env.VITE_CLAUDE_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-haiku-20240307',
      max_tokens: 500,
      messages: [{
        role: 'user',
        content: `Analyze these search results for "${query}":\n\n${results.map(r => r.snippet).join('\n\n')}`
      }]
    })
  });
  
  const data = await response.json();
  return {
    source: 'claude',
    summary: data.content[0].text,
    keyPoints: extractKeyPoints(data.content[0].text),
    confidence: 0.85,
  };
}
```

---

### 7. Redis Caching (1 hour)

**Why**: Reduce API costs, improve speed

```bash
# Install Upstash Redis
npm install @upstash/redis
```

```typescript
// src/lib/cache.ts
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: import.meta.env.VITE_UPSTASH_REDIS_URL,
  token: import.meta.env.VITE_UPSTASH_REDIS_TOKEN,
});

export async function getCachedSearch(query: string): Promise<SearchResponse | null> {
  const cacheKey = `search:${query.toLowerCase()}:${Math.floor(Date.now() / 3600000)}`;
  const cached = await redis.get<SearchResponse>(cacheKey);
  return cached;
}

export async function setCachedSearch(query: string, data: SearchResponse): Promise<void> {
  const cacheKey = `search:${query.toLowerCase()}:${Math.floor(Date.now() / 3600000)}`;
  await redis.set(cacheKey, data, { ex: 3600 }); // 1 hour TTL
}

// src/lib/search.ts - Use cache
export async function performSearch(query: string): Promise<SearchResponse> {
  // Check cache first
  const cached = await getCachedSearch(query);
  if (cached) {
    console.log('Cache hit!');
    return cached;
  }
  
  // Perform search
  const results = await getGoogleSearchResults(query);
  const aiSummary = await generateAISummary(query, results);
  
  const response = { results, aiSummary, query, totalResults: results.length };
  
  // Cache for next time
  await setCachedSearch(query, response);
  
  return response;
}
```

---

### 8. Source Credibility Scoring (2 hours)

**Why**: Help users identify trustworthy sources

```typescript
// src/lib/credibility.ts
export interface CredibilityScore {
  score: number; // 0-100
  badges: string[];
  reasoning: string;
}

export function calculateCredibility(result: SearchResult): CredibilityScore {
  let score = 50; // Base score
  const badges: string[] = [];
  const reasons: string[] = [];
  
  const domain = result.displayLink.toLowerCase();
  
  // Academic domains
  if (domain.endsWith('.edu')) {
    score += 25;
    badges.push('🎓 Academic');
    reasons.push('Educational institution');
  }
  
  // Government domains
  if (domain.endsWith('.gov')) {
    score += 30;
    badges.push('🏛️ Government');
    reasons.push('Official government source');
  }
  
  // Trusted news outlets
  const trustedNews = ['nytimes.com', 'bbc.com', 'reuters.com', 'apnews.com'];
  if (trustedNews.some(site => domain.includes(site))) {
    score += 20;
    badges.push('📰 Verified News');
    reasons.push('Established news organization');
  }
  
  // HTTPS
  if (result.link.startsWith('https://')) {
    score += 5;
    reasons.push('Secure connection');
  }
  
  // Recent publication
  if (result.publishedDate) {
    const daysSince = (Date.now() - new Date(result.publishedDate).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSince < 30) {
      score += 10;
      badges.push('🆕 Recent');
      reasons.push('Published recently');
    }
  }
  
  return {
    score: Math.min(100, score),
    badges,
    reasoning: reasons.join(', '),
  };
}
```

```typescript
// src/components/SearchResults.tsx - Display credibility
const credibility = calculateCredibility(result);

<div className="flex items-center gap-2 mb-2">
  {/* Trust score */}
  <div className={`px-2 py-1 rounded text-xs font-medium ${
    credibility.score >= 80 ? 'bg-green-500/20 text-green-400' :
    credibility.score >= 60 ? 'bg-yellow-500/20 text-yellow-400' :
    'bg-gray-500/20 text-gray-400'
  }`}>
    Trust: {credibility.score}/100
  </div>
  
  {/* Badges */}
  {credibility.badges.map((badge, idx) => (
    <span key={idx} className="text-xs">{badge}</span>
  ))}
</div>
```

---

### 9. Smart Filters (1.5 hours)

**Why**: Users want to refine results

```typescript
// src/components/SearchFilters.tsx
export interface SearchFilters {
  timeRange: 'any' | '24h' | 'week' | 'month' | 'year';
  contentType: 'any' | 'article' | 'video' | 'pdf' | 'academic';
  sortBy: 'relevance' | 'date' | 'credibility';
}

export default function SearchFilters({ 
  filters, 
  onChange 
}: { 
  filters: SearchFilters; 
  onChange: (filters: SearchFilters) => void;
}) {
  return (
    <div className="flex gap-4 mb-6 flex-wrap">
      {/* Time Range */}
      <select
        value={filters.timeRange}
        onChange={(e) => onChange({ ...filters, timeRange: e.target.value as any })}
        className="px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-sm"
      >
        <option value="any">Any time</option>
        <option value="24h">Last 24 hours</option>
        <option value="week">Past week</option>
        <option value="month">Past month</option>
        <option value="year">Past year</option>
      </select>
      
      {/* Content Type */}
      <select
        value={filters.contentType}
        onChange={(e) => onChange({ ...filters, contentType: e.target.value as any })}
        className="px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-sm"
      >
        <option value="any">All types</option>
        <option value="article">Articles</option>
        <option value="video">Videos</option>
        <option value="pdf">PDFs</option>
        <option value="academic">Academic</option>
      </select>
      
      {/* Sort By */}
      <select
        value={filters.sortBy}
        onChange={(e) => onChange({ ...filters, sortBy: e.target.value as any })}
        className="px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-sm"
      >
        <option value="relevance">Most relevant</option>
        <option value="date">Most recent</option>
        <option value="credibility">Most credible</option>
      </select>
    </div>
  );
}
```

---

## Performance Optimizations

### 10. Progressive Loading

```typescript
// src/App.tsx - Load in stages
const [loadingStage, setLoadingStage] = useState<'idle' | 'searching' | 'ai' | 'complete'>('idle');

const handleSearch = async () => {
  setLoadingStage('searching');
  
  // Stage 1: Get search results (fast)
  const results = await getGoogleSearchResults(query);
  setSearchData({ results, aiSummary: '', query, totalResults: results.length });
  
  setLoadingStage('ai');
  
  // Stage 2: Generate AI summary (slower)
  const aiSummary = await generateAISummary(query, results);
  setSearchData(prev => ({ ...prev!, aiSummary }));
  
  setLoadingStage('complete');
};
```

---

## Testing & Validation

```bash
# Install dependencies
npm install date-fns @upstash/redis

# Add to .env
VITE_CLAUDE_API_KEY=your_claude_key
VITE_UPSTASH_REDIS_URL=your_redis_url
VITE_UPSTASH_REDIS_TOKEN=your_redis_token

# Test
npm run dev
```

---

## Success Metrics

Track these in your analytics:

1. **Time to First Result**: < 500ms
2. **Cache Hit Rate**: > 60%
3. **User Engagement**: Clicks per search > 2
4. **Follow-up Rate**: > 30% of users ask follow-ups
5. **Save Rate**: > 10% of results saved

---

## Next Steps

1. ✅ Implement 5 quick wins today
2. ⏳ Set up Redis caching this week
3. ⏳ Add multi-perspective AI next week
4. ⏳ Build knowledge graph visualization (month 2)
5. ⏳ Launch mobile app (month 3)

**Remember**: Ship fast, iterate based on user feedback!
