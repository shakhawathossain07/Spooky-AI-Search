import { useState, useEffect, useCallback, memo } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import { GoogleIcon, LogoutIcon, UserIcon, HistoryIcon, BookmarkIcon, CloseIcon } from './Icons';

interface AuthSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UserStats {
  totalSearches: number;
  savedTopics: string[];
  recentSearches: { query: string; timestamp: string }[];
}

function AuthSidebarComponent({ isOpen, onClose }: AuthSidebarProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userStats, setUserStats] = useState<UserStats>({
    totalSearches: 0,
    savedTopics: [],
    recentSearches: []
  });

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserData(session.user.id);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserData(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserData = async (userId: string) => {
    try {
      // Load search history from Supabase
      const { data: searches } = await supabase
        .from('search_history')
        .select('query, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      // Load user preferences/topics
      const { data: userData } = await supabase
        .from('users')
        .select('interest_areas')
        .eq('id', userId)
        .single();

      const searchList = searches as { query: string; created_at: string }[] | null;
      const userInfo = userData as { interest_areas: string[] } | null;

      setUserStats({
        totalSearches: searchList?.length || 0,
        savedTopics: userInfo?.interest_areas || [],
        recentSearches: searchList?.map(s => ({
          query: s.query,
          timestamp: s.created_at
        })) || []
      });
    } catch (err) {
      console.error('Error loading user data:', err);
    }
  };

  const handleGoogleSignIn = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      
      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      setUserStats({ totalSearches: 0, savedTopics: [], recentSearches: [] });
    } catch (err) {
      console.error('Sign out error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full w-80 bg-gray-900/95 backdrop-blur-xl border-r border-purple-500/30 z-50 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <h2 className="text-lg font-semibold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              {user ? 'Your Account' : 'Sign In'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <CloseIcon size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {user ? (
              /* Logged In View */
              <div className="space-y-6">
                {/* User Profile */}
                <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl">
                  {user.user_metadata?.avatar_url ? (
                    <img 
                      src={user.user_metadata.avatar_url} 
                      alt="Profile" 
                      className="w-12 h-12 rounded-full border-2 border-purple-500"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                      <UserIcon size={24} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">
                      {user.user_metadata?.full_name || 'User'}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-800/30 rounded-xl text-center">
                    <p className="text-2xl font-bold text-purple-400">{userStats.totalSearches}</p>
                    <p className="text-xs text-gray-400">Searches</p>
                  </div>
                  <div className="p-3 bg-gray-800/30 rounded-xl text-center">
                    <p className="text-2xl font-bold text-cyan-400">{userStats.savedTopics.length}</p>
                    <p className="text-xs text-gray-400">Topics</p>
                  </div>
                </div>

                {/* Recent Searches */}
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3">
                    <HistoryIcon size={16} />
                    Recent Searches
                  </h3>
                  {userStats.recentSearches.length > 0 ? (
                    <div className="space-y-2">
                      {userStats.recentSearches.slice(0, 5).map((search, i) => (
                        <div key={i} className="flex items-center justify-between p-2 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors cursor-pointer">
                          <span className="text-sm text-gray-300 truncate flex-1">{search.query}</span>
                          <span className="text-xs text-gray-500 ml-2">{formatDate(search.timestamp)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">No searches yet</p>
                  )}
                </div>

                {/* Saved Topics */}
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3">
                    <BookmarkIcon size={16} />
                    Saved Topics
                  </h3>
                  {userStats.savedTopics.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {userStats.savedTopics.map((topic, i) => (
                        <span key={i} className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs">
                          {topic}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">No topics saved</p>
                  )}
                </div>

                {/* Sign Out Button */}
                <button
                  onClick={handleSignOut}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 transition-colors disabled:opacity-50"
                >
                  <LogoutIcon size={18} />
                  {loading ? 'Signing out...' : 'Sign Out'}
                </button>
              </div>
            ) : (
              /* Logged Out View */
              <div className="space-y-6">
                <div className="text-center py-8">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center">
                    <UserIcon size={40} />
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">Welcome to Spooky AI</h3>
                  <p className="text-sm text-gray-400">
                    Sign in to sync your search history, save topics, and access your data across devices.
                  </p>
                </div>

                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm text-center">
                    {error}
                  </div>
                )}

                {/* Google Sign In */}
                <button
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white hover:bg-gray-100 rounded-xl text-gray-800 font-medium transition-colors disabled:opacity-50"
                >
                  <GoogleIcon size={20} />
                  {loading ? 'Connecting...' : 'Continue with Google'}
                </button>

                {/* Benefits */}
                <div className="space-y-3 pt-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Benefits</p>
                  <div className="space-y-2">
                    {[
                      { icon: <HistoryIcon size={16} />, text: 'Sync search history across devices' },
                      { icon: <BookmarkIcon size={16} />, text: 'Save topics and reading materials' },
                      { icon: <UserIcon size={16} />, text: 'Personalized AI recommendations' }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm text-gray-400">
                        <span className="text-purple-400">{item.icon}</span>
                        {item.text}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-800 text-center">
            <p className="text-xs text-gray-500">
              Your data is securely stored with Supabase
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

const AuthSidebar = memo(AuthSidebarComponent);
export default AuthSidebar;

// Export helper to save search to Supabase
export async function saveSearchToSupabase(query: string, results?: unknown, aiSummary?: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('search_history') as any).insert({
      user_id: user.id,
      query,
      query_type: 'text',
      results: results || null,
      ai_summary: aiSummary || null
    });
  } catch (err) {
    console.error('Error saving search:', err);
  }
}

// Export helper to save topic
export async function saveTopicToSupabase(topic: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  try {
    const { data: userData } = await supabase
      .from('users')
      .select('interest_areas')
      .eq('id', user.id)
      .single();

    const userInfo = userData as { interest_areas: string[] } | null;
    const currentTopics = userInfo?.interest_areas || [];
    if (!currentTopics.includes(topic)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('users') as any).upsert({
        id: user.id,
        interest_areas: [...currentTopics, topic]
      });
    }
  } catch (err) {
    console.error('Error saving topic:', err);
  }
}
