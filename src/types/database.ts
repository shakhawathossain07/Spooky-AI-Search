// Database types generated from Supabase schema
// This file provides TypeScript types for all database tables

export type ExpertiseLevel = 'beginner' | 'intermediate' | 'expert';
export type QueryType = 'text' | 'voice' | 'image' | 'code';
export type AnnotationType = 'comment' | 'highlight' | 'note';
export type ParticipantRole = 'owner' | 'editor' | 'viewer';
export type ResultDensity = 'concise' | 'balanced' | 'detailed';

export interface UserPreferences {
  resultDensity: ResultDensity;
  enablePersonalization: boolean;
  anonymousMode: boolean;
  preferredSources: string[];
  excludedSources: string[];
}

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string | null;
          created_at: string;
          updated_at: string;
          expertise_level: ExpertiseLevel;
          interest_areas: string[];
          preferences: UserPreferences;
        };
        Insert: {
          id: string;
          email?: string | null;
          created_at?: string;
          updated_at?: string;
          expertise_level?: ExpertiseLevel;
          interest_areas?: string[];
          preferences?: UserPreferences;
        };
        Update: {
          id?: string;
          email?: string | null;
          created_at?: string;
          updated_at?: string;
          expertise_level?: ExpertiseLevel;
          interest_areas?: string[];
          preferences?: UserPreferences;
        };
      };
      search_sessions: {
        Row: {
          id: string;
          created_by: string | null;
          created_at: string;
          updated_at: string;
          expires_at: string;
          is_shared: boolean;
          session_name: string | null;
          metadata: Record<string, any>;
        };
        Insert: {
          id?: string;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
          expires_at?: string;
          is_shared?: boolean;
          session_name?: string | null;
          metadata?: Record<string, any>;
        };
        Update: {
          id?: string;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
          expires_at?: string;
          is_shared?: boolean;
          session_name?: string | null;
          metadata?: Record<string, any>;
        };
      };
      search_history: {
        Row: {
          id: string;
          user_id: string | null;
          session_id: string | null;
          query: string;
          query_type: QueryType;
          query_embedding: number[] | null;
          results: Record<string, any> | null;
          ai_summary: string | null;
          knowledge_graph: Record<string, any> | null;
          processing_time_ms: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          session_id?: string | null;
          query: string;
          query_type?: QueryType;
          query_embedding?: number[] | null;
          results?: Record<string, any> | null;
          ai_summary?: string | null;
          knowledge_graph?: Record<string, any> | null;
          processing_time_ms?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          session_id?: string | null;
          query?: string;
          query_type?: QueryType;
          query_embedding?: number[] | null;
          results?: Record<string, any> | null;
          ai_summary?: string | null;
          knowledge_graph?: Record<string, any> | null;
          processing_time_ms?: number | null;
          created_at?: string;
        };
      };
      annotations: {
        Row: {
          id: string;
          session_id: string;
          user_id: string;
          result_id: string;
          content: string;
          annotation_type: AnnotationType;
          metadata: Record<string, any>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          user_id: string;
          result_id: string;
          content: string;
          annotation_type?: AnnotationType;
          metadata?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          user_id?: string;
          result_id?: string;
          content?: string;
          annotation_type?: AnnotationType;
          metadata?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        };
      };
      cached_results: {
        Row: {
          id: string;
          query_hash: string;
          query_text: string;
          query_embedding: number[] | null;
          results: Record<string, any>;
          ai_summary: string | null;
          knowledge_graph: Record<string, any> | null;
          perspectives: Record<string, any> | null;
          follow_up_questions: string[] | null;
          created_at: string;
          expires_at: string;
          hit_count: number;
          last_accessed_at: string;
        };
        Insert: {
          id?: string;
          query_hash: string;
          query_text: string;
          query_embedding?: number[] | null;
          results: Record<string, any>;
          ai_summary?: string | null;
          knowledge_graph?: Record<string, any> | null;
          perspectives?: Record<string, any> | null;
          follow_up_questions?: string[] | null;
          created_at?: string;
          expires_at?: string;
          hit_count?: number;
          last_accessed_at?: string;
        };
        Update: {
          id?: string;
          query_hash?: string;
          query_text?: string;
          query_embedding?: number[] | null;
          results?: Record<string, any>;
          ai_summary?: string | null;
          knowledge_graph?: Record<string, any> | null;
          perspectives?: Record<string, any> | null;
          follow_up_questions?: string[] | null;
          created_at?: string;
          expires_at?: string;
          hit_count?: number;
          last_accessed_at?: string;
        };
      };
      session_participants: {
        Row: {
          session_id: string;
          user_id: string;
          joined_at: string;
          last_active: string;
          role: ParticipantRole;
        };
        Insert: {
          session_id: string;
          user_id: string;
          joined_at?: string;
          last_active?: string;
          role?: ParticipantRole;
        };
        Update: {
          session_id?: string;
          user_id?: string;
          joined_at?: string;
          last_active?: string;
          role?: ParticipantRole;
        };
      };
    };
    Functions: {
      cleanup_expired_cache: {
        Args: Record<string, never>;
        Returns: void;
      };
      cleanup_expired_sessions: {
        Args: Record<string, never>;
        Returns: void;
      };
      increment_cache_hit: {
        Args: { cache_id: string };
        Returns: void;
      };
    };
  };
}
