/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_OPENAI_API_KEY: string
  readonly VITE_SEARCH_API_KEY: string
  readonly VITE_SEARCH_API_PROVIDER: string
  readonly VITE_REDIS_URL: string
  readonly VITE_REDIS_TOKEN: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
