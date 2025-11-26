// Search functionality using Google APIs

const GOOGLE_SEARCH_API_KEY = import.meta.env.VITE_GOOGLE_SEARCH_API_KEY;
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  displayLink: string;
  image?: string;
  thumbnail?: string;
  publishedDate?: string;
  credibilityScore?: number;
}

export interface SearchResponse {
  results: SearchResult[];
  aiSummary: string;
  query: string;
  totalResults: number;
  images?: Array<{
    link: string;
    thumbnail: string;
    title: string;
    source: string;
  }>;
  videos?: Array<{
    link: string;
    thumbnail: string;
    title: string;
    source: string;
    duration?: string;
  }>;
  relatedQuestions?: string[];
  searchTime?: number;
}

export async function performSearch(query: string): Promise<SearchResponse> {
  if (!query.trim()) {
    throw new Error('Please enter a search query');
  }

  const startTime = Date.now();

  try {
    // Step 1: Get search results, images, and videos from Google in parallel
    const [searchResults, images, videos] = await Promise.all([
      getGoogleSearchResults(query),
      getGoogleImages(query),
      getGoogleVideos(query)
    ]);
    
    if (searchResults.length === 0) {
      return {
        results: [],
        aiSummary: 'No results found for your query. Try different keywords.',
        query,
        totalResults: 0,
        images: images || [],
        videos: videos || [],
        searchTime: Date.now() - startTime,
      };
    }
    
    // Step 2: Generate AI summary and related questions in parallel
    const [aiSummary, relatedQuestions] = await Promise.all([
      generateAISummary(query, searchResults),
      generateRelatedQuestions(query, searchResults),
    ]);
    
    // Step 3: Calculate credibility scores
    const resultsWithScores = searchResults.map(result => ({
      ...result,
      credibilityScore: calculateCredibilityScore(result),
    }));
    
    return {
      results: resultsWithScores,
      aiSummary,
      query,
      totalResults: resultsWithScores.length,
      images: images || [],
      videos: videos || [],
      relatedQuestions,
      searchTime: Date.now() - startTime,
    };
  } catch (error) {
    console.error('Search error:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to perform search. Please try again.');
  }
}

async function getGoogleSearchResults(query: string): Promise<SearchResult[]> {
  // Your Google Custom Search Engine ID
  const CX_ID = '17fa9a5ae1f2d4281';
  
  const url = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_SEARCH_API_KEY}&cx=${CX_ID}&q=${encodeURIComponent(query)}`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Google Search API error:', errorData);
      throw new Error(`Search failed: ${response.status === 429 ? 'Rate limit exceeded' : response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      return [];
    }
    
    return data.items.slice(0, 10).map((item: any) => ({
      title: item.title || 'Untitled',
      link: item.link || '#',
      snippet: item.snippet || 'No description available',
      displayLink: item.displayLink || new URL(item.link).hostname,
      image: item.pagemap?.cse_image?.[0]?.src || item.pagemap?.cse_thumbnail?.[0]?.src,
      thumbnail: item.pagemap?.cse_thumbnail?.[0]?.src,
      publishedDate: item.pagemap?.metatags?.[0]?.['article:published_time'] || 
                      item.pagemap?.metatags?.[0]?.['og:updated_time'] ||
                      item.pagemap?.metatags?.[0]?.['datePublished'] ||
                      null,
    }));
  } catch (error) {
    console.error('Error fetching search results:', error);
    throw error;
  }
}

async function getGoogleImages(query: string): Promise<Array<{link: string; thumbnail: string; title: string; source: string}>> {
  const CX_ID = '17fa9a5ae1f2d4281';
  
  // Search for images using searchType=image
  const url = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_SEARCH_API_KEY}&cx=${CX_ID}&q=${encodeURIComponent(query)}&searchType=image&num=8`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('Image search failed:', response.statusText);
      return [];
    }
    
    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      return [];
    }
    
    return data.items.map((item: any) => ({
      link: item.link,
      thumbnail: item.image?.thumbnailLink || item.link,
      title: item.title || 'Image',
      source: item.displayLink || 'Unknown source',
    }));
  } catch (error) {
    console.error('Error fetching images:', error);
    return [];
  }
}

async function getGoogleVideos(query: string): Promise<Array<{link: string; thumbnail: string; title: string; source: string; duration?: string}>> {
  const CX_ID = '17fa9a5ae1f2d4281';
  
  // Search for videos - we'll search for video-related results
  const videoQuery = `${query} video`;
  const url = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_SEARCH_API_KEY}&cx=${CX_ID}&q=${encodeURIComponent(videoQuery)}&num=6`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('Video search failed:', response.statusText);
      return [];
    }
    
    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      return [];
    }
    
    // Filter for video results (YouTube, Vimeo, etc.)
    const videoResults = data.items
      .filter((item: any) => {
        const link = item.link.toLowerCase();
        return link.includes('youtube.com') || 
               link.includes('youtu.be') || 
               link.includes('vimeo.com') ||
               link.includes('dailymotion.com') ||
               item.pagemap?.videoobject;
      })
      .slice(0, 6)
      .map((item: any) => {
        // Extract video thumbnail
        const thumbnail = 
          item.pagemap?.cse_thumbnail?.[0]?.src ||
          item.pagemap?.videoobject?.[0]?.thumbnailurl ||
          item.pagemap?.cse_image?.[0]?.src ||
          getYouTubeThumbnail(item.link);
        
        // Extract duration if available
        const duration = item.pagemap?.videoobject?.[0]?.duration || undefined;
        
        return {
          link: item.link,
          thumbnail: thumbnail || 'https://via.placeholder.com/320x180?text=Video',
          title: item.title || 'Video',
          source: item.displayLink || 'Unknown source',
          duration: duration,
        };
      });
    
    return videoResults;
  } catch (error) {
    console.error('Error fetching videos:', error);
    return [];
  }
}

function getYouTubeThumbnail(url: string): string {
  // Extract YouTube video ID and generate thumbnail URL
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(youtubeRegex);
  
  if (match && match[1]) {
    return `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg`;
  }
  
  return '';
}

async function generateAISummary(query: string, results: SearchResult[]): Promise<string> {
  if (!results.length) {
    return 'No search results found to summarize.';
  }

  const context = results
    .slice(0, 8) // Use top 8 results for better context
    .map((r, i) => `Source ${i + 1}: ${r.title}\n${r.snippet}\nURL: ${r.displayLink}`)
    .join('\n\n');
  
  const prompt = `You are an expert research assistant. Analyze these search results for "${query}" and provide a comprehensive, well-structured answer.

${context}

Provide:
1. A clear, direct answer (2-3 sentences)
2. Key points (3-4 bullet points with • prefix)
3. Important context or nuances

Format your response clearly with proper spacing and cite sources when relevant using [Source X] notation.`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 600,
          topP: 0.95,
        }
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Gemini API error:', errorData);
      
      // Fallback: Create a basic summary from snippets
      return createFallbackSummary(query, results);
    }
    
    const data = await response.json();
    
    if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
      return data.candidates[0].content.parts[0].text;
    }
    
    return createFallbackSummary(query, results);
  } catch (error) {
    console.error('Error generating AI summary:', error);
    return createFallbackSummary(query, results);
  }
}

async function generateRelatedQuestions(query: string, _results: SearchResult[]): Promise<string[]> {
  const prompt = `Based on the search query "${query}", generate 5 related follow-up questions that users might want to explore. 

Make them:
- Specific and actionable
- Naturally flowing from the original query
- Diverse in perspective

Return ONLY the questions, one per line, without numbering.`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 200,
        }
      })
    });
    
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts[0]?.text || '';
    
    return text
      .split('\n')
      .filter((q: string) => q.trim())
      .map((q: string) => q.replace(/^\d+\.\s*/, '').replace(/^[-•]\s*/, '').trim())
      .filter((q: string) => q.length > 10)
      .slice(0, 5);
  } catch (error) {
    console.error('Error generating related questions:', error);
    return [];
  }
}

function calculateCredibilityScore(result: SearchResult): number {
  let score = 50; // Base score
  
  const domain = result.displayLink.toLowerCase();
  
  // Academic domains
  if (domain.endsWith('.edu')) score += 25;
  
  // Government domains
  if (domain.endsWith('.gov')) score += 30;
  
  // Trusted news outlets
  const trustedNews = ['nytimes.com', 'bbc.com', 'reuters.com', 'apnews.com', 'theguardian.com', 'wsj.com'];
  if (trustedNews.some(site => domain.includes(site))) score += 20;
  
  // Wikipedia
  if (domain.includes('wikipedia.org')) score += 15;
  
  // HTTPS
  if (result.link.startsWith('https://')) score += 5;
  
  // Recent publication (if available)
  if (result.publishedDate) {
    const daysSince = (Date.now() - new Date(result.publishedDate).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSince < 30) score += 10;
    else if (daysSince < 90) score += 5;
  }
  
  return Math.min(100, Math.max(0, score));
}

function createFallbackSummary(query: string, results: SearchResult[]): string {
  // Create a smart fallback summary from the search results
  const topResults = results.slice(0, 3);
  const summary = `Based on the search results for "${query}":\n\n${topResults.map((r, i) => 
    `${i + 1}. ${r.title} (${r.displayLink})\n   ${r.snippet}`
  ).join('\n\n')}`;
  
  return summary;
}
