import { useState, useEffect, useCallback, useRef } from 'react'
import NightSkyBackground from './components/NightSkyBackground'
import SearchResults from './components/SearchResults'
import MusicPlayer from './components/MusicPlayer'
import StudyMode from './components/StudyMode'
import VoiceSearch from './components/VoiceSearch'

import SearchHistory, { saveToHistory } from './components/SearchHistory'
import QuickActions from './components/QuickActions'
import AuthSidebar, { saveSearchToSupabase } from './components/AuthSidebar'
import Logo from './components/Logo'
import { SearchIcon, StudyIcon, LoadingIcon, GhostIcon, UserIcon } from './components/Icons'
import { performSearch, type SearchResponse } from './lib/search'
import { supabase } from './lib/supabase'
import { User } from '@supabase/supabase-js'

type AppMode = 'search' | 'study';

function App() {
  const [mode, setMode] = useState<AppMode>('search')
  const [query, setQuery] = useState('')
  const [searchData, setSearchData] = useState<SearchResponse | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchCount, setSearchCount] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  // Load search count from localStorage
  useEffect(() => {
    const count = localStorage.getItem('totalSearches');
    if (count) setSearchCount(parseInt(count));
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Debounce ref to prevent rapid searches
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSearchRef = useRef<string>('');

  const handleSearch = useCallback(async (searchQuery?: string) => {
    const q = (searchQuery || query).trim();
    if (!q) return;
    
    // Prevent duplicate searches
    if (q === lastSearchRef.current && searchData) return;
    
    // Clear any pending search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    setIsSearching(true);
    setError(null);
    lastSearchRef.current = q;
    
    try {
      const results = await performSearch(q);
      setSearchData(results);
      
      // Save to history and increment count
      saveToHistory(q);
      const newCount = searchCount + 1;
      setSearchCount(newCount);
      localStorage.setItem('totalSearches', newCount.toString());
      
      // Save to Supabase if user is logged in
      if (user) {
        saveSearchToSupabase(q, results.results, results.aiSummary);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSearching(false);
    }
  }, [query, searchData, searchCount, user]);

  const handleNewSearch = useCallback(() => {
    setSearchData(null);
    setQuery('');
    setError(null);
    lastSearchRef.current = '';
  }, []);

  const handleQuestionClick = useCallback((question: string) => {
    setQuery(question);
    handleSearch(question);
  }, [handleSearch]);

  const handleVoiceTranscript = useCallback((text: string) => {
    setQuery(text);
  }, []);

  const handleVoiceSearch = useCallback(() => {
    if (query.trim()) {
      handleSearch();
    }
  }, [query, handleSearch]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const input = document.querySelector<HTMLInputElement>('input[type="text"]');
        input?.focus();
        input?.select();
      }
      
      if (e.key === 'Escape' && searchData) {
        handleNewSearch();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchData]);

  return (
    <div className="min-h-screen bg-spooky-dark text-white relative overflow-hidden">
      <NightSkyBackground />
      <MusicPlayer />
      
      {/* Auth Sidebar */}
      <AuthSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      

      
      {/* User/Login Button - Fixed Position (Left Side) */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed top-4 left-4 z-[100] flex items-center gap-2 px-4 py-2 bg-gray-900/80 backdrop-blur-xl rounded-full border border-purple-500/30 hover:border-purple-500/60 transition-all duration-300 hover:scale-105 group shadow-lg"
      >
        {user ? (
          <>
            {user.user_metadata?.avatar_url ? (
              <img 
                src={user.user_metadata.avatar_url} 
                alt="Profile" 
                className="w-7 h-7 rounded-full border border-purple-500"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                <UserIcon size={16} />
              </div>
            )}
            <span className="text-sm text-gray-300 hidden sm:inline">
              {user.user_metadata?.full_name?.split(' ')[0] || 'Account'}
            </span>
          </>
        ) : (
          <>
            <UserIcon size={20} />
            <span className="text-sm text-gray-300">Sign In</span>
          </>
        )}
      </button>
      
      <div className="container mx-auto px-4 py-8 relative" style={{ zIndex: 10 }}>
        {/* Mode Toggle */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-gray-900/60 backdrop-blur-xl rounded-full p-1 border border-purple-500/30">
            <button
              onClick={() => setMode('search')}
              className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 flex items-center gap-2 ${
                mode === 'search'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <SearchIcon size={18} /> Search Mode
            </button>
            <button
              onClick={() => setMode('study')}
              className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 flex items-center gap-2 ${
                mode === 'study'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <StudyIcon size={18} /> Study Mode
            </button>
          </div>
        </div>

        <header className="text-center mb-12">
          <div className="relative inline-block">
            {/* Glow effect */}
            <div className="absolute inset-0 blur-3xl opacity-40 animate-pulse">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600"></div>
            </div>
            
            {/* Professional Logo */}
            <div className="relative flex flex-col items-center">
              <Logo size="xl" showText={false} className="mb-4 animate-float" />
              
              <h1 className="text-5xl md:text-6xl font-black tracking-tight">
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                  Spooky
                </span>
                {' '}
                <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  AI
                </span>
                {' '}
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Search
                </span>
              </h1>
            </div>
            
            {/* Decorative sparkles */}
            <div className="absolute -top-2 -left-8 text-2xl opacity-70 animate-pulse">✨</div>
            <div className="absolute -top-2 -right-8 text-2xl opacity-70 animate-pulse" style={{ animationDelay: '0.5s' }}>✨</div>
          </div>
          
          <p className="text-gray-400 text-base mt-4 font-light tracking-wide">
            Next-generation AI-powered search engine
          </p>
          
          {/* Stats Bar */}
          {searchCount > 0 && (
            <div className="mt-3 flex items-center justify-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                {searchCount.toLocaleString()} searches performed
              </span>
            </div>
          )}
        </header>

        <main className="max-w-4xl mx-auto">
          {mode === 'study' ? (
            <StudyMode />
          ) : (
            <>
              {/* Search Bar */}
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-cyan-600/20 rounded-2xl blur-xl animate-pulse"></div>
                
                <div className="relative">
                  <div className="absolute -top-3 -left-3 w-6 h-6 border-t-2 border-l-2 border-purple-400 rounded-tl-lg opacity-60"></div>
                  <div className="absolute -top-3 -right-3 w-6 h-6 border-t-2 border-r-2 border-cyan-400 rounded-tr-lg opacity-60"></div>
                  <div className="absolute -bottom-3 -left-3 w-6 h-6 border-b-2 border-l-2 border-blue-400 rounded-bl-lg opacity-60"></div>
                  <div className="absolute -bottom-3 -right-3 w-6 h-6 border-b-2 border-r-2 border-pink-400 rounded-br-lg opacity-60"></div>
                  
                  <div className="flex gap-2 p-2 bg-gray-900/60 backdrop-blur-xl rounded-2xl border border-purple-500/30 shadow-2xl shadow-purple-500/20">
                    <div className="flex items-center pl-4">
                      <SearchIcon size={24} />
                    </div>
                    
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !isSearching) {
                          handleSearch();
                        }
                      }}
                      placeholder="Ask anything... ✨"
                      className="flex-1 px-4 py-4 bg-transparent text-white text-lg placeholder-gray-400 focus:outline-none"
                      style={{ caretColor: '#a855f7' }}
                      disabled={isSearching}
                    />
                    
                    {/* Voice Search */}
                    <VoiceSearch 
                      onTranscript={handleVoiceTranscript}
                      onSearch={handleVoiceSearch}
                    />
                    
                    <button
                      className="group relative px-6 py-3 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 rounded-xl font-bold text-white overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => handleSearch()}
                      disabled={isSearching || !query.trim()}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                      
                      <span className="relative flex items-center gap-2">
                        {isSearching ? (
                          <>
                            <LoadingIcon size={20} />
                            <span className="hidden sm:inline">Searching...</span>
                          </>
                        ) : (
                          <>
                            <span>Search</span>
                            <GhostIcon size={20} />
                          </>
                        )}
                      </span>
                    </button>
                  </div>
                </div>
                
                {/* Search History & Shortcuts */}
                <div className="flex items-center justify-between mt-4">
                  <SearchHistory onSelect={(q) => { setQuery(q); handleSearch(q); }} />
                  
                  <p className="text-xs text-gray-500 flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <kbd className="px-2 py-0.5 bg-gray-800/50 rounded border border-gray-700/50 text-gray-400">⌘K</kbd>
                      <span>Focus</span>
                    </span>
                    <span className="text-gray-700">•</span>
                    <span className="flex items-center gap-1">
                      <kbd className="px-2 py-0.5 bg-gray-800/50 rounded border border-gray-700/50 text-gray-400">↵</kbd>
                      <span>Search</span>
                    </span>
                  </p>
                </div>
              </div>

              {/* Quick Actions */}
              {!searchData && !isSearching && (
                <QuickActions onAction={(q) => { setQuery(q); handleSearch(q); }} />
              )}

              {/* Error */}
              {error && (
                <div className="mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-center">
                  {error}
                </div>
              )}

              {/* Results */}
              {searchData ? (
                <SearchResults 
                  searchData={searchData} 
                  onNewSearch={handleNewSearch}
                  onQuestionClick={handleQuestionClick}
                />
              ) : !isSearching && (
                <div className="text-center mt-12">
                  <p className="text-gray-400 text-sm flex items-center justify-center gap-2">
                    <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    <span>Powered by Google Gemini AI • Ready to search</span>
                    <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  </p>
                </div>
              )}
            </>
          )}
        </main>
        
        {/* Footer */}
        <footer className="mt-16 text-center text-xs text-gray-600">
          <p>Built with ❤️ using React, Vite, and Google Gemini AI</p>
        </footer>
      </div>
    </div>
  )
}

export default App
