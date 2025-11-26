-- ============================================================================
-- Spooky AI Search - Database Schema (Extensions Already Enabled)
-- ============================================================================
-- This version assumes pgvector and uuid-ossp are already enabled
-- ============================================================================

-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
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
CREATE TABLE IF NOT EXISTS public.search_sessions (
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
CREATE TABLE IF NOT EXISTS public.search_history (
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
CREATE TABLE IF NOT EXISTS public.annotations (
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
CREATE TABLE IF NOT EXISTS public.cached_results (
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
CREATE TABLE IF NOT EXISTS public.session_participants (
  session_id UUID REFERENCES public.search_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  last_active TIMESTAMPTZ DEFAULT NOW(),
  role TEXT CHECK (role IN ('owner', 'editor', 'viewer')) DEFAULT 'editor',
  PRIMARY KEY (session_id, user_id)
);

-- Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at);

CREATE INDEX IF NOT EXISTS idx_search_sessions_created_by ON public.search_sessions(created_by);
CREATE INDEX IF NOT EXISTS idx_search_sessions_created_at ON public.search_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_search_sessions_expires_at ON public.search_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_search_sessions_is_shared ON public.search_sessions(is_shared);

CREATE INDEX IF NOT EXISTS idx_search_history_user_id ON public.search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_session_id ON public.search_history(session_id);
CREATE INDEX IF NOT EXISTS idx_search_history_created_at ON public.search_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_search_history_query_type ON public.search_history(query_type);

-- Vector similarity search index
CREATE INDEX IF NOT EXISTS idx_search_history_embedding ON public.search_history 
  USING ivfflat (query_embedding vector_cosine_ops)
  WITH (lists = 100);

CREATE INDEX IF NOT EXISTS idx_annotations_session_id ON public.annotations(session_id);
CREATE INDEX IF NOT EXISTS idx_annotations_user_id ON public.annotations(user_id);
CREATE INDEX IF NOT EXISTS idx_annotations_result_id ON public.annotations(result_id);
CREATE INDEX IF NOT EXISTS idx_annotations_created_at ON public.annotations(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_cached_results_query_hash ON public.cached_results(query_hash);
CREATE INDEX IF NOT EXISTS idx_cached_results_expires_at ON public.cached_results(expires_at);
CREATE INDEX IF NOT EXISTS idx_cached_results_created_at ON public.cached_results(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cached_results_hit_count ON public.cached_results(hit_count DESC);

CREATE INDEX IF NOT EXISTS idx_cached_results_embedding ON public.cached_results 
  USING ivfflat (query_embedding vector_cosine_ops)
  WITH (lists = 100);

CREATE INDEX IF NOT EXISTS idx_session_participants_user_id ON public.session_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_session_participants_last_active ON public.session_participants(last_active DESC);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.annotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cached_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_participants ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DO $$ 
BEGIN
  -- Users policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can view own profile') THEN
    CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can update own profile') THEN
    CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can insert own profile') THEN
    CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
  END IF;

  -- Search sessions policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'search_sessions' AND policyname = 'Users can view own sessions') THEN
    CREATE POLICY "Users can view own sessions" ON public.search_sessions FOR SELECT 
    USING (created_by = auth.uid() OR id IN (SELECT session_id FROM public.session_participants WHERE user_id = auth.uid()));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'search_sessions' AND policyname = 'Users can create sessions') THEN
    CREATE POLICY "Users can create sessions" ON public.search_sessions FOR INSERT WITH CHECK (created_by = auth.uid());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'search_sessions' AND policyname = 'Users can update own sessions') THEN
    CREATE POLICY "Users can update own sessions" ON public.search_sessions FOR UPDATE USING (created_by = auth.uid());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'search_sessions' AND policyname = 'Users can delete own sessions') THEN
    CREATE POLICY "Users can delete own sessions" ON public.search_sessions FOR DELETE USING (created_by = auth.uid());
  END IF;

  -- Search history policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'search_history' AND policyname = 'Users can view own search history') THEN
    CREATE POLICY "Users can view own search history" ON public.search_history FOR SELECT 
    USING (user_id = auth.uid() OR session_id IN (SELECT session_id FROM public.session_participants WHERE user_id = auth.uid()));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'search_history' AND policyname = 'Users can insert search history') THEN
    CREATE POLICY "Users can insert search history" ON public.search_history FOR INSERT WITH CHECK (user_id = auth.uid() OR user_id IS NULL);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'search_history' AND policyname = 'Users can update own search history') THEN
    CREATE POLICY "Users can update own search history" ON public.search_history FOR UPDATE USING (user_id = auth.uid());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'search_history' AND policyname = 'Users can delete own search history') THEN
    CREATE POLICY "Users can delete own search history" ON public.search_history FOR DELETE USING (user_id = auth.uid());
  END IF;

  -- Cached results policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cached_results' AND policyname = 'Authenticated users can view cached results') THEN
    CREATE POLICY "Authenticated users can view cached results" ON public.cached_results FOR SELECT TO authenticated USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cached_results' AND policyname = 'Anonymous users can view cached results') THEN
    CREATE POLICY "Anonymous users can view cached results" ON public.cached_results FOR SELECT TO anon USING (true);
  END IF;
END $$;

-- Create functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM public.cached_results WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM public.search_sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_cache_hit(cache_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.cached_results
  SET hit_count = hit_count + 1, last_accessed_at = NOW()
  WHERE id = cache_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, created_at)
  VALUES (NEW.id, NEW.email, NOW())
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_search_sessions_updated_at ON public.search_sessions;
CREATE TRIGGER update_search_sessions_updated_at
  BEFORE UPDATE ON public.search_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_annotations_updated_at ON public.annotations;
CREATE TRIGGER update_annotations_updated_at
  BEFORE UPDATE ON public.annotations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-uploads', 'user-uploads', false)
ON CONFLICT (id) DO NOTHING;
