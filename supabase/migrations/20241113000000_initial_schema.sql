-- ============================================================================
-- Spooky AI Search - Initial Database Schema
-- ============================================================================
-- 
-- IMPORTANT: Before running this migration, enable the pgvector extension:
-- 1. Go to Supabase Dashboard → Database → Extensions
-- 2. Search for "pgvector"
-- 3. Click the toggle to Enable
-- 4. Then run this migration
--
-- If you get an error about pgvector not being available, you skipped step 1!
-- See supabase/TROUBLESHOOTING.md for help.
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgvector";

-- Create users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expertise_level TEXT CHECK (expertise_level IN ('beginner', 'intermediate', 'expert')) DEFAULT 'intermediate',
  interest_areas TEXT[] DEFAULT '{}',
  preferences JSONB DEFAULT '{
    "resultDensity": "balanced",
    "enablePersonalization": true,
    "anonymousMode": false,
    "preferredSources": [],
    "excludedSources": []
  }'::jsonb
);

-- Create search_sessions table
CREATE TABLE public.search_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days',
  is_shared BOOLEAN DEFAULT false,
  session_name TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create search_history table with vector embeddings
CREATE TABLE public.search_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.search_sessions(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  query_type TEXT CHECK (query_type IN ('text', 'voice', 'image', 'code')) DEFAULT 'text',
  query_embedding VECTOR(1536),
  results JSONB,
  ai_summary TEXT,
  knowledge_graph JSONB,
  processing_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create annotations table
CREATE TABLE public.annotations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES public.search_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  result_id TEXT NOT NULL,
  content TEXT NOT NULL,
  annotation_type TEXT CHECK (annotation_type IN ('comment', 'highlight', 'note')) DEFAULT 'comment',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create cached_results table
CREATE TABLE public.cached_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  query_hash TEXT UNIQUE NOT NULL,
  query_text TEXT NOT NULL,
  query_embedding VECTOR(1536),
  results JSONB NOT NULL,
  ai_summary TEXT,
  knowledge_graph JSONB,
  perspectives JSONB,
  follow_up_questions TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '1 hour',
  hit_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create session_participants table
CREATE TABLE public.session_participants (
  session_id UUID REFERENCES public.search_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  last_active TIMESTAMPTZ DEFAULT NOW(),
  role TEXT CHECK (role IN ('owner', 'editor', 'viewer')) DEFAULT 'editor',
  PRIMARY KEY (session_id, user_id)
);

-- Create indexes for performance optimization
-- Users table indexes
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_created_at ON public.users(created_at);

-- Search sessions indexes
CREATE INDEX idx_search_sessions_created_by ON public.search_sessions(created_by);
CREATE INDEX idx_search_sessions_created_at ON public.search_sessions(created_at);
CREATE INDEX idx_search_sessions_expires_at ON public.search_sessions(expires_at);
CREATE INDEX idx_search_sessions_is_shared ON public.search_sessions(is_shared);

-- Search history indexes
CREATE INDEX idx_search_history_user_id ON public.search_history(user_id);
CREATE INDEX idx_search_history_session_id ON public.search_history(session_id);
CREATE INDEX idx_search_history_created_at ON public.search_history(created_at DESC);
CREATE INDEX idx_search_history_query_type ON public.search_history(query_type);
-- Vector similarity search index using IVFFlat
CREATE INDEX idx_search_history_embedding ON public.search_history 
  USING ivfflat (query_embedding vector_cosine_ops)
  WITH (lists = 100);

-- Annotations indexes
CREATE INDEX idx_annotations_session_id ON public.annotations(session_id);
CREATE INDEX idx_annotations_user_id ON public.annotations(user_id);
CREATE INDEX idx_annotations_result_id ON public.annotations(result_id);
CREATE INDEX idx_annotations_created_at ON public.annotations(created_at DESC);

-- Cached results indexes
CREATE INDEX idx_cached_results_query_hash ON public.cached_results(query_hash);
CREATE INDEX idx_cached_results_expires_at ON public.cached_results(expires_at);
CREATE INDEX idx_cached_results_created_at ON public.cached_results(created_at DESC);
CREATE INDEX idx_cached_results_hit_count ON public.cached_results(hit_count DESC);
-- Vector similarity search index for cached results
CREATE INDEX idx_cached_results_embedding ON public.cached_results 
  USING ivfflat (query_embedding vector_cosine_ops)
  WITH (lists = 100);

-- Session participants indexes
CREATE INDEX idx_session_participants_user_id ON public.session_participants(user_id);
CREATE INDEX idx_session_participants_last_active ON public.session_participants(last_active DESC);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.annotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cached_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_participants ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own profile (on signup)
CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies for search_sessions table
-- Users can view sessions they created or are participants in
CREATE POLICY "Users can view own sessions"
  ON public.search_sessions FOR SELECT
  USING (
    created_by = auth.uid() OR
    id IN (
      SELECT session_id FROM public.session_participants
      WHERE user_id = auth.uid()
    )
  );

-- Users can create sessions
CREATE POLICY "Users can create sessions"
  ON public.search_sessions FOR INSERT
  WITH CHECK (created_by = auth.uid());

-- Users can update sessions they created
CREATE POLICY "Users can update own sessions"
  ON public.search_sessions FOR UPDATE
  USING (created_by = auth.uid());

-- Users can delete sessions they created
CREATE POLICY "Users can delete own sessions"
  ON public.search_sessions FOR DELETE
  USING (created_by = auth.uid());

-- RLS Policies for search_history table
-- Users can view their own search history or history in sessions they participate in
CREATE POLICY "Users can view own search history"
  ON public.search_history FOR SELECT
  USING (
    user_id = auth.uid() OR
    session_id IN (
      SELECT session_id FROM public.session_participants
      WHERE user_id = auth.uid()
    )
  );

-- Users can insert their own search history
CREATE POLICY "Users can insert search history"
  ON public.search_history FOR INSERT
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- Users can update their own search history
CREATE POLICY "Users can update own search history"
  ON public.search_history FOR UPDATE
  USING (user_id = auth.uid());

-- Users can delete their own search history
CREATE POLICY "Users can delete own search history"
  ON public.search_history FOR DELETE
  USING (user_id = auth.uid());

-- RLS Policies for annotations table
-- Users can view annotations in sessions they participate in
CREATE POLICY "Users can view session annotations"
  ON public.annotations FOR SELECT
  USING (
    session_id IN (
      SELECT session_id FROM public.session_participants
      WHERE user_id = auth.uid()
    )
  );

-- Users can create annotations in sessions they participate in
CREATE POLICY "Users can create annotations"
  ON public.annotations FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    session_id IN (
      SELECT session_id FROM public.session_participants
      WHERE user_id = auth.uid()
    )
  );

-- Users can update their own annotations
CREATE POLICY "Users can update own annotations"
  ON public.annotations FOR UPDATE
  USING (user_id = auth.uid());

-- Users can delete their own annotations
CREATE POLICY "Users can delete own annotations"
  ON public.annotations FOR DELETE
  USING (user_id = auth.uid());

-- RLS Policies for cached_results table
-- All authenticated users can read cached results (public cache)
CREATE POLICY "Authenticated users can view cached results"
  ON public.cached_results FOR SELECT
  TO authenticated
  USING (true);

-- Anonymous users can also read cached results
CREATE POLICY "Anonymous users can view cached results"
  ON public.cached_results FOR SELECT
  TO anon
  USING (true);

-- Only service role can insert/update/delete cached results
CREATE POLICY "Service role can manage cached results"
  ON public.cached_results FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- RLS Policies for session_participants table
-- Users can view participants in sessions they're part of
CREATE POLICY "Users can view session participants"
  ON public.session_participants FOR SELECT
  USING (
    session_id IN (
      SELECT session_id FROM public.session_participants
      WHERE user_id = auth.uid()
    )
  );

-- Session owners can add participants
CREATE POLICY "Session owners can add participants"
  ON public.session_participants FOR INSERT
  WITH CHECK (
    session_id IN (
      SELECT id FROM public.search_sessions
      WHERE created_by = auth.uid()
    )
  );

-- Users can remove themselves from sessions
CREATE POLICY "Users can leave sessions"
  ON public.session_participants FOR DELETE
  USING (user_id = auth.uid());

-- Session owners can remove participants
CREATE POLICY "Session owners can remove participants"
  ON public.session_participants FOR DELETE
  USING (
    session_id IN (
      SELECT id FROM public.search_sessions
      WHERE created_by = auth.uid()
    )
  );

-- Users can update their own participation record
CREATE POLICY "Users can update own participation"
  ON public.session_participants FOR UPDATE
  USING (user_id = auth.uid());

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_search_sessions_updated_at
  BEFORE UPDATE ON public.search_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_annotations_updated_at
  BEFORE UPDATE ON public.annotations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to clean up expired cache entries
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM public.cached_results
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM public.search_sessions
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update cache hit count and last accessed time
CREATE OR REPLACE FUNCTION increment_cache_hit(cache_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.cached_results
  SET hit_count = hit_count + 1,
      last_accessed_at = NOW()
  WHERE id = cache_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, created_at)
  VALUES (NEW.id, NEW.email, NOW())
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Create storage bucket for user uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-uploads', 'user-uploads', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies for user uploads
CREATE POLICY "Users can upload their own files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'user-uploads' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can view their own files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'user-uploads' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update their own files"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'user-uploads' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete their own files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'user-uploads' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Create indexes on auth.users for better performance
CREATE INDEX IF NOT EXISTS idx_auth_users_email ON auth.users(email);

-- Add comments for documentation
COMMENT ON TABLE public.users IS 'Extended user profiles with preferences and expertise levels';
COMMENT ON TABLE public.search_sessions IS 'Collaborative search sessions that can be shared among users';
COMMENT ON TABLE public.search_history IS 'Historical record of all searches with embeddings for semantic search';
COMMENT ON TABLE public.annotations IS 'User annotations and comments on search results within sessions';
COMMENT ON TABLE public.cached_results IS 'Cached search results with AI-generated summaries and knowledge graphs';
COMMENT ON TABLE public.session_participants IS 'Junction table tracking users participating in shared sessions';

COMMENT ON COLUMN public.search_history.query_embedding IS 'Vector embedding of the search query for semantic similarity search';
COMMENT ON COLUMN public.cached_results.query_embedding IS 'Vector embedding for finding similar cached queries';
COMMENT ON COLUMN public.cached_results.hit_count IS 'Number of times this cached result has been accessed';
