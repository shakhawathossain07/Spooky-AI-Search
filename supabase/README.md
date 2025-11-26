# Supabase Backend Configuration

This directory contains the database schema, migrations, and configuration for the Spooky AI Search backend.

## Database Schema

The database includes the following tables:

### Core Tables

1. **users** - Extended user profiles with preferences and expertise levels
   - Extends Supabase `auth.users`
   - Stores expertise level, interest areas, and user preferences
   - Automatically created on user signup via trigger

2. **search_sessions** - Collaborative search sessions
   - Can be shared among multiple users
   - 30-day expiration by default
   - Tracks session metadata and ownership

3. **search_history** - Historical search records
   - Stores all search queries with results
   - Includes vector embeddings for semantic search
   - Links to users and sessions

4. **annotations** - User annotations on search results
   - Comments, highlights, and notes
   - Shared within collaborative sessions
   - Real-time synchronized

5. **cached_results** - Cached search results
   - Stores AI-generated summaries and knowledge graphs
   - 1-hour expiration by default
   - Tracks hit count for cache optimization

6. **session_participants** - Session membership tracking
   - Junction table for many-to-many relationship
   - Tracks roles (owner, editor, viewer)
   - Monitors last activity timestamps

## Features

### Vector Search with pgvector

The schema includes the `pgvector` extension for semantic search capabilities:
- Query embeddings stored as 1536-dimensional vectors (OpenAI embedding size)
- IVFFlat indexes for fast similarity search
- Cosine similarity for finding related queries

### Row Level Security (RLS)

All tables have RLS enabled with comprehensive policies:
- Users can only access their own data
- Session participants can view shared session data
- Cached results are publicly readable for performance
- Service role has full access for background jobs

### Performance Optimization

Multiple indexes created for common query patterns:
- User lookups by email and ID
- Session queries by creator and expiration
- Search history by user, session, and timestamp
- Vector similarity indexes for embeddings
- Cache lookups by query hash

### Automatic Maintenance

Built-in functions for data management:
- `cleanup_expired_cache()` - Removes expired cache entries
- `cleanup_expired_sessions()` - Removes expired sessions
- `increment_cache_hit()` - Updates cache statistics
- `handle_new_user()` - Auto-creates user profiles on signup

### Storage Buckets

- **user-uploads** bucket for image and file uploads
- 50MB file size limit
- Restricted to authenticated users
- User-specific folder structure for privacy

## Setup Instructions

### Local Development

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Initialize Supabase locally:
   ```bash
   supabase init
   ```

3. Start local Supabase:
   ```bash
   supabase start
   ```

4. Apply migrations:
   ```bash
   supabase db reset
   ```

5. Get your local credentials:
   ```bash
   supabase status
   ```

### Production Deployment

**IMPORTANT: Enable pgvector extension first!**

1. Go to Supabase Dashboard → Database → Extensions
2. Search for "pgvector" and enable it
3. Link to your Supabase project:
   ```bash
   supabase link --project-ref your-project-ref
   ```

4. Push migrations to production:
   ```bash
   supabase db push
   ```

5. Verify the schema:
   ```bash
   supabase db diff
   ```

**Troubleshooting:** If you get a pgvector error, see `TROUBLESHOOTING.md`

### Authentication Configuration

The system supports two authentication methods:

1. **Email/Password Authentication**
   - Enable in Supabase Dashboard → Authentication → Providers
   - Configure email templates for verification
   - Set up SMTP for email delivery

2. **Anonymous Authentication**
   - Enable in Supabase Dashboard → Authentication → Providers
   - Allows users to search without creating an account
   - Anonymous sessions can be converted to permanent accounts

### Environment Variables

Add these to your `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Get these values from:
- Supabase Dashboard → Settings → API
- Or run `supabase status` for local development

## Maintenance

### Cache Cleanup

Run periodically to remove expired cache entries:

```sql
SELECT cleanup_expired_cache();
```

Consider setting up a cron job or pg_cron extension:

```sql
-- Run cache cleanup every hour
SELECT cron.schedule(
  'cleanup-cache',
  '0 * * * *',
  'SELECT cleanup_expired_cache();'
);
```

### Session Cleanup

Remove expired sessions:

```sql
SELECT cleanup_expired_sessions();
```

### Monitoring

Key metrics to monitor:
- Cache hit rate: `SELECT AVG(hit_count) FROM cached_results;`
- Active sessions: `SELECT COUNT(*) FROM search_sessions WHERE expires_at > NOW();`
- Storage usage: Check Supabase Dashboard → Storage
- Database size: Check Supabase Dashboard → Database

## Security Considerations

1. **RLS Policies**: All tables have RLS enabled - never disable in production
2. **API Keys**: Keep `service_role` key secret - only use in backend functions
3. **Storage**: User uploads are private by default
4. **Rate Limiting**: Implement at application level (100 queries/minute per user)
5. **Data Encryption**: All data encrypted at rest (AES-256) and in transit (TLS 1.3)

## Troubleshooting

### Migration Errors

If migrations fail:
```bash
# Reset local database
supabase db reset

# Or manually rollback
supabase db rollback
```

### RLS Issues

If queries fail with permission errors:
- Check RLS policies are correctly defined
- Verify user authentication token is valid
- Use service role key for admin operations

### Vector Search Performance

If vector searches are slow:
- Ensure IVFFlat indexes are created
- Increase `lists` parameter for larger datasets
- Consider using HNSW index for better performance (requires pgvector 0.5.0+)

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [pgvector Documentation](https://github.com/pgvector/pgvector)
- [PostgreSQL RLS Guide](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
