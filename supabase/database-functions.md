# Database Functions Reference

This document describes the custom database functions available in Spooky AI Search.

## Maintenance Functions

### cleanup_expired_cache()

Removes expired cache entries from the `cached_results` table.

**Usage:**
```sql
SELECT cleanup_expired_cache();
```

**When to use:**
- Run periodically (recommended: hourly via cron job)
- After bulk cache operations
- During maintenance windows

**Example with pg_cron:**
```sql
-- Schedule to run every hour
SELECT cron.schedule(
  'cleanup-cache-hourly',
  '0 * * * *',
  'SELECT cleanup_expired_cache();'
);
```

---

### cleanup_expired_sessions()

Removes expired search sessions and associated data.

**Usage:**
```sql
SELECT cleanup_expired_sessions();
```

**When to use:**
- Run daily to clean up old sessions
- Before database backups
- During low-traffic periods

**Example with pg_cron:**
```sql
-- Schedule to run daily at 2 AM
SELECT cron.schedule(
  'cleanup-sessions-daily',
  '0 2 * * *',
  'SELECT cleanup_expired_sessions();'
);
```

---

### increment_cache_hit(cache_id UUID)

Updates cache statistics when a cached result is accessed.

**Parameters:**
- `cache_id` - UUID of the cached result

**Usage:**
```sql
SELECT increment_cache_hit('123e4567-e89b-12d3-a456-426614174000');
```

**When to use:**
- Called automatically by edge functions when serving cached results
- Updates `hit_count` and `last_accessed_at` fields
- Used for cache optimization and analytics

**Example in TypeScript:**
```typescript
import { supabase } from './lib/supabase';

// After retrieving cached result
await supabase.rpc('increment_cache_hit', {
  cache_id: cachedResult.id
});
```

---

## Automatic Triggers

### handle_new_user()

Automatically creates a user profile when a new user signs up.

**Trigger:** `on_auth_user_created`
**Fires:** After INSERT on `auth.users`

**What it does:**
- Creates a record in `public.users` table
- Copies email from auth.users
- Sets default preferences
- Initializes expertise level to 'intermediate'

**No manual action required** - This runs automatically on user signup.

---

### update_updated_at_column()

Automatically updates the `updated_at` timestamp on record changes.

**Triggers:**
- `update_users_updated_at` - On `users` table
- `update_search_sessions_updated_at` - On `search_sessions` table
- `update_annotations_updated_at` - On `annotations` table

**Fires:** Before UPDATE on respective tables

**No manual action required** - Timestamps update automatically.

---

## Query Examples

### Find Similar Queries (Vector Search)

Find cached results similar to a query using vector embeddings:

```sql
SELECT 
  query_text,
  results,
  ai_summary,
  1 - (query_embedding <=> $1::vector) AS similarity
FROM cached_results
WHERE query_embedding IS NOT NULL
ORDER BY query_embedding <=> $1::vector
LIMIT 10;
```

**Parameters:**
- `$1` - Query embedding vector (1536 dimensions)

**Usage in TypeScript:**
```typescript
const { data, error } = await supabase.rpc('search_similar_queries', {
  query_embedding: embeddingArray
});
```

---

### Get User Search History with Embeddings

Retrieve a user's search history with semantic similarity:

```sql
SELECT 
  query,
  results,
  ai_summary,
  created_at,
  1 - (query_embedding <=> $1::vector) AS similarity
FROM search_history
WHERE user_id = $2
  AND query_embedding IS NOT NULL
ORDER BY query_embedding <=> $1::vector
LIMIT 20;
```

---

### Get Active Session Participants

Find all active participants in a session:

```sql
SELECT 
  u.email,
  u.expertise_level,
  sp.role,
  sp.last_active
FROM session_participants sp
JOIN users u ON u.id = sp.user_id
WHERE sp.session_id = $1
  AND sp.last_active > NOW() - INTERVAL '5 minutes'
ORDER BY sp.last_active DESC;
```

---

### Cache Hit Rate Analytics

Calculate cache performance metrics:

```sql
SELECT 
  COUNT(*) as total_cached_queries,
  SUM(hit_count) as total_hits,
  AVG(hit_count) as avg_hits_per_query,
  MAX(hit_count) as max_hits,
  COUNT(CASE WHEN hit_count > 0 THEN 1 END) as queries_with_hits,
  ROUND(
    COUNT(CASE WHEN hit_count > 0 THEN 1 END)::numeric / 
    COUNT(*)::numeric * 100, 
    2
  ) as hit_rate_percentage
FROM cached_results
WHERE created_at > NOW() - INTERVAL '24 hours';
```

---

### Popular Search Topics

Find most searched topics in the last 7 days:

```sql
SELECT 
  query,
  COUNT(*) as search_count,
  MAX(created_at) as last_searched
FROM search_history
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY query
ORDER BY search_count DESC
LIMIT 20;
```

---

## Performance Optimization

### Analyze Query Performance

Check index usage and query performance:

```sql
-- Check index usage
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan as index_scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

-- Check table sizes
SELECT 
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

### Vacuum and Analyze

Keep database optimized:

```sql
-- Analyze all tables to update statistics
ANALYZE;

-- Vacuum to reclaim space
VACUUM;

-- Full vacuum (requires exclusive lock, use during maintenance)
VACUUM FULL;
```

---

## Monitoring Queries

### Active Connections

Monitor database connections:

```sql
SELECT 
  datname,
  usename,
  application_name,
  client_addr,
  state,
  query,
  query_start
FROM pg_stat_activity
WHERE datname = current_database()
ORDER BY query_start DESC;
```

---

### Long Running Queries

Find queries taking too long:

```sql
SELECT 
  pid,
  now() - query_start as duration,
  query,
  state
FROM pg_stat_activity
WHERE state != 'idle'
  AND now() - query_start > interval '5 seconds'
ORDER BY duration DESC;
```

---

## Backup and Restore

### Create Backup

```bash
# Using Supabase CLI
supabase db dump -f backup.sql

# Or using pg_dump
pg_dump -h db.your-project.supabase.co -U postgres -d postgres > backup.sql
```

### Restore Backup

```bash
# Using Supabase CLI
supabase db reset
supabase db push

# Or using psql
psql -h db.your-project.supabase.co -U postgres -d postgres < backup.sql
```

---

## Security Notes

1. **Use service_role key** for maintenance functions in backend only
2. **Never expose service_role key** in frontend code
3. **RLS policies** protect all user data automatically
4. **Audit logs** are available in Supabase Dashboard
5. **Monitor for anomalies** using the queries above

---

## Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [pgvector Documentation](https://github.com/pgvector/pgvector)
- [Supabase Database Guide](https://supabase.com/docs/guides/database)
- [pg_cron Extension](https://github.com/citusdata/pg_cron)
