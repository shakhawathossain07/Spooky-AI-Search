import type { SearchResponse, SearchResult } from '../lib/search';
import RelatedQuestions from './RelatedQuestions';

interface SearchResultsProps {
  searchData: SearchResponse;
  onNewSearch: () => void;
  onQuestionClick?: (question: string) => void;
}

function getCredibilityBadge(score: number) {
  if (score >= 80) return { color: 'green', label: 'High Trust', icon: '✓' };
  if (score >= 60) return { color: 'yellow', label: 'Medium Trust', icon: '~' };
  return { color: 'gray', label: 'Low Trust', icon: '?' };
}

export default function SearchResults({ searchData, onNewSearch, onQuestionClick }: SearchResultsProps) {
  const handleCopyLink = (link: string, e: React.MouseEvent) => {
    e.preventDefault();
    navigator.clipboard.writeText(link);
    alert('Link copied to clipboard!');
  };

  const handleShare = async (result: SearchResult, e: React.MouseEvent) => {
    e.preventDefault();
    if (navigator.share) {
      try {
        await navigator.share({
          title: result.title,
          text: result.snippet,
          url: result.link,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      handleCopyLink(result.link, e);
    }
  };

  const handleSave = (result: SearchResult, e: React.MouseEvent) => {
    e.preventDefault();
    const saved = JSON.parse(localStorage.getItem('savedResults') || '[]');
    saved.push({ ...result, savedAt: new Date().toISOString() });
    localStorage.setItem('savedResults', JSON.stringify(saved));
    alert('Result saved! Check your browser storage.');
  };
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Enhanced AI Summary Card */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-cyan-600/10 rounded-2xl blur-xl animate-pulse"></div>
        <div className="relative bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl rounded-2xl border border-purple-500/30 p-8 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="text-4xl animate-bounce" style={{ animationDuration: '3s' }}>✨</div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                  AI-Powered Analysis
                </h2>
                <p className="text-xs text-gray-500">Powered by Google Gemini</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Live</span>
            </div>
          </div>

          {/* Summary Content */}
          <div className="prose prose-invert max-w-none">
            <div className="text-gray-200 leading-relaxed whitespace-pre-wrap text-lg">
              {searchData.aiSummary}
            </div>
          </div>

          {/* Stats Bar */}
          <div className="mt-6 pt-6 border-t border-gray-700/50 flex items-center justify-between text-sm flex-wrap gap-4">
            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Sources:</span>
                <span className="font-semibold text-purple-400">{searchData.totalResults}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Query:</span>
                <span className="font-semibold text-cyan-400">"{searchData.query}"</span>
              </div>
              {searchData.searchTime && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>{(searchData.searchTime / 1000).toFixed(2)}s</span>
                </div>
              )}
            </div>
            <button className="text-gray-400 hover:text-purple-400 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Related Questions */}
      {searchData.relatedQuestions && searchData.relatedQuestions.length > 0 && (
        <RelatedQuestions 
          questions={searchData.relatedQuestions}
          onQuestionClick={(question) => {
            if (onQuestionClick) {
              onQuestionClick(question);
            }
          }}
        />
      )}

      {/* Media Gallery - Images and Videos */}
      {((searchData.images && searchData.images.length > 0) || (searchData.videos && searchData.videos.length > 0)) && (
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-600/10 via-purple-600/10 to-blue-600/10 rounded-2xl blur-xl"></div>
          <div className="relative bg-gray-900/70 backdrop-blur-xl rounded-2xl border border-pink-500/30 p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-200 flex items-center gap-3 mb-4">
              <span className="text-2xl">🎬</span>
              <span>Related Media</span>
            </h3>
            
            {/* Videos Section */}
            {searchData.videos && searchData.videos.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
                  <span>▶️</span>
                  <span>Videos</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {searchData.videos.slice(0, 6).map((video, idx) => (
                    <a
                      key={idx}
                      href={video.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative aspect-video rounded-xl overflow-hidden border border-gray-700/50 hover:border-pink-500/50 transition-all duration-300 hover:scale-105"
                    >
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="320" height="180"%3E%3Crect fill="%23374151" width="320" height="180"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%239CA3AF" font-family="sans-serif"%3EVideo%3C/text%3E%3C/svg%3E';
                        }}
                      />
                      {/* Play button overlay */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 bg-red-600/90 rounded-full flex items-center justify-center group-hover:bg-red-500 transition-colors shadow-2xl">
                          <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                      {/* Video info overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <p className="text-xs text-white font-medium line-clamp-2">{video.title}</p>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-xs text-gray-400">{video.source}</p>
                            {video.duration && (
                              <span className="text-xs bg-black/60 px-2 py-0.5 rounded">{video.duration}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
            
            {/* Images Section */}
            {searchData.images && searchData.images.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
                  <span>🖼️</span>
                  <span>Images</span>
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {searchData.images.slice(0, 8).map((img, idx) => (
                    <a
                      key={idx}
                      href={img.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative aspect-square rounded-xl overflow-hidden border border-gray-700/50 hover:border-pink-500/50 transition-all duration-300 hover:scale-105"
                    >
                      <img
                        src={img.thumbnail}
                        alt={img.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23374151" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%239CA3AF" font-family="sans-serif"%3ENo Image%3C/text%3E%3C/svg%3E';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <p className="text-xs text-white font-medium line-clamp-2">{img.title}</p>
                          <p className="text-xs text-gray-400 mt-1">{img.source}</p>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Enhanced Search Results */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold text-gray-200 flex items-center gap-3">
            <span className="text-3xl">🔍</span>
            <span>Top Results</span>
            <span className="text-sm font-normal text-gray-500">({searchData.totalResults} sources)</span>
          </h3>
          <div className="flex gap-2">
            <button className="px-3 py-1 text-xs bg-gray-800/50 border border-gray-700/50 rounded-lg hover:border-purple-500/50 transition-colors">
              Most Relevant
            </button>
          </div>
        </div>
        
        <div className="grid gap-4">
          {searchData.results.map((result, index) => (
            <div
              key={index}
              className="relative group animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {/* Hover glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-cyan-600/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <a
                href={result.link}
                target="_blank"
                rel="noopener noreferrer"
                className="relative block bg-gradient-to-br from-gray-900/70 to-gray-800/70 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 hover:border-purple-500/50 transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl hover:shadow-purple-500/10"
              >
                <div className="flex gap-5">
                  {/* Rank Badge or Thumbnail */}
                  <div className="flex-shrink-0">
                    {result.image || result.thumbnail ? (
                      <div className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-gray-700/50 group-hover:border-purple-500/50 transition-colors">
                        <img
                          src={result.thumbnail || result.image}
                          alt={result.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const parent = (e.target as HTMLElement).parentElement;
                            if (parent) {
                              parent.innerHTML = `<div class="w-full h-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold text-2xl">${index + 1}</div>`;
                            }
                          }}
                        />
                        <div className="absolute top-1 left-1 w-6 h-6 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-lg">
                          {index + 1}
                        </div>
                      </div>
                    ) : (
                      <div className="relative w-12 h-12">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 rounded-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                        <div className="relative w-full h-full bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          {index + 1}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Title */}
                    <h4 className="text-xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-cyan-400 group-hover:bg-clip-text transition-all line-clamp-2">
                      {result.title}
                    </h4>
                    
                    {/* URL */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-4 h-4 bg-green-500/20 rounded flex items-center justify-center">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      </div>
                      <span className="text-sm text-green-400 font-medium">{result.displayLink}</span>
                      <span className="text-gray-600">•</span>
                      <span className="text-xs text-gray-500">Verified Source</span>
                    </div>
                    
                    {/* Credibility Score */}
                    {result.credibilityScore !== undefined && (
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <div className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 ${
                          result.credibilityScore >= 80 ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                          result.credibilityScore >= 60 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                          'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                        }`}>
                          <span>{getCredibilityBadge(result.credibilityScore).icon}</span>
                          <span>{getCredibilityBadge(result.credibilityScore).label}</span>
                          <span className="ml-1 opacity-70">({result.credibilityScore}/100)</span>
                        </div>
                        
                        {/* Domain badges */}
                        {result.displayLink.endsWith('.edu') && (
                          <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded border border-blue-500/30">
                            🎓 Academic
                          </span>
                        )}
                        {result.displayLink.endsWith('.gov') && (
                          <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded border border-purple-500/30">
                            🏛️ Government
                          </span>
                        )}
                      </div>
                    )}
                    
                    {/* Snippet */}
                    <p className="text-gray-300 text-sm leading-relaxed line-clamp-3 mb-4">
                      {result.snippet}
                    </p>

                    {/* Action Bar */}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <button 
                        onClick={(e) => handleSave(result, e)}
                        className="flex items-center gap-1 hover:text-purple-400 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                        Save
                      </button>
                      <button 
                        onClick={(e) => handleShare(result, e)}
                        className="flex items-center gap-1 hover:text-cyan-400 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                        Share
                      </button>
                      <button 
                        onClick={(e) => handleCopyLink(result.link, e)}
                        className="flex items-center gap-1 hover:text-blue-400 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copy
                      </button>
                      <div className="flex-1"></div>
                      <span className="flex items-center gap-1 text-purple-400 font-medium">
                        Read more
                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* New Search Button */}
      <div className="text-center pt-8">
        <button
          onClick={onNewSearch}
          className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 rounded-xl font-bold text-white overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          <span className="relative flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span>New Search</span>
          </span>
        </button>
      </div>
    </div>
  );
}
