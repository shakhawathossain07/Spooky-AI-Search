# Troubleshooting Guide

Common issues and solutions when setting up Supabase for Spooky AI Search.

## pgvector Extension Errors

### Error: "extension pgvector is not available"

**Full Error:**
```
ERROR: 0A000: extension "pgvector" is not available
DETAIL: Could not open extension control file
HINT: The extension must first be installed on the system where PostgreSQL is running.
```

**Solution:**

You need to enable the pgvector extension through the Supabase Dashboard BEFORE running migrations.

**Steps:**
1. Go to Supabase Dashboard
2. Navigate to **Database** → **Extensions**
3. Search for "pgvector"
4. Click the toggle to **Enable**
5. Wait for confirmation
6. Now run your migration again

**Why this happens:**
The migration script tries to create the extension, but Supabase requires extensions to be enabled through the dashboard first for security reasons.

---

## Migration Errors

### Error: "relation already exists"

**Solution:**
You've already run the migration. To reset:

```bash
# Using Supabase CLI
supabase db reset

# Or manually drop tables in SQL Editor
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```

Then re-run the migration.

---

### Error: "permission denied for schema public"

**Solution:**
Grant proper permissions:

```sql
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO authenticated;
GRANT ALL ON SCHEMA public TO anon;
```

---

## Authentication Errors

### Error: "Invalid API key"

**Symptoms:**
- 401 Unauthorized errors
- "Invalid API key" in console

**Solution:**
1. Check your `.env` file has correct values
2. Get fresh keys from Supabase Dashboard → Settings → API
3. Make sure you're using `anon` key in frontend (not `service_role`)
4. Restart your dev server after updating `.env`

---

### Error: "Email not confirmed"

**Symptoms:**
- User can't sign in after signup
- "Email not confirmed" error

**Solution:**

**For Development:**
1. Go to Authentication → Users in Supabase Dashboard
2. Find the user
3. Click the three dots → Confirm email

**For Production:**
1. Configure SMTP settings (Settings → Auth)
2. Customize email templates (Authentication → Email Templates)
3. Test email delivery

---

### Anonymous Auth Not Working

**Symptoms:**
- Can't sign in anonymously
- "Anonymous sign-ins are disabled" error

**Solution:**
1. Go to Authentication → Providers
2. Find "Anonymous" in the list
3. Toggle to **Enabled**
4. Save changes

---

## Database Connection Errors

### Error: "Too many connections"

**Symptoms:**
- "FATAL: sorry, too many clients already"
- Connection timeouts

**Solution:**

**Immediate fix:**
```sql
-- Kill idle connections
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE state = 'idle'
AND state_change < NOW() - INTERVAL '10 minutes';
```

**Long-term fix:**
1. Enable connection pooling (Supabase Pro)
2. Use Supavisor connection string
3. Implement connection pooling in your app

---

### Error: "Connection timeout"

**Solution:**
1. Check your internet connection
2. Verify Supabase project is running (not paused)
3. Check if you're using correct URL
4. Try restarting Supabase (for local dev)

---

## RLS (Row Level Security) Errors

### Error: "new row violates row-level security policy"

**Symptoms:**
- Can't insert/update data
- 403 Forbidden errors

**Solution:**

**Check if user is authenticated:**
```typescript
const { data: { user } } = await supabase.auth.getUser();
console.log('Current user:', user);
```

**Verify RLS policies:**
```sql
-- Check policies for a table
SELECT * FROM pg_policies WHERE tablename = 'your_table_name';
```

**Common causes:**
- User not authenticated
- User ID doesn't match policy
- Missing WITH CHECK clause in policy

---

### Error: "permission denied for table"

**Solution:**

Grant permissions:
```sql
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
```

Or check if RLS is blocking access (intended behavior).

---

## Storage Errors

### Error: "Bucket not found"

**Solution:**

Create the bucket:
```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-uploads', 'user-uploads', false);
```

Or check if it exists:
```sql
SELECT * FROM storage.buckets;
```

---

### Error: "File size exceeds limit"

**Solution:**

Increase bucket size limit:
```sql
UPDATE storage.buckets
SET file_size_limit = 52428800  -- 50MB in bytes
WHERE id = 'user-uploads';
```

---

## Vector Search Errors

### Error: "operator does not exist: vector <=> vector"

**Symptoms:**
- Vector similarity search fails
- "operator does not exist" error

**Solution:**
1. Ensure pgvector extension is enabled
2. Check vector column type:
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'search_history'
AND column_name = 'query_embedding';
```

Should show `USER-DEFINED` type.

---

### Error: "dimension mismatch"

**Symptoms:**
- "expected 1536 dimensions, got X"

**Solution:**
Ensure your embeddings are exactly 1536 dimensions (OpenAI standard):

```typescript
// Correct
const embedding = await openai.embeddings.create({
  model: "text-embedding-ada-002",
  input: query,
});
// embedding.data[0].embedding.length === 1536
```

---

## Local Development Errors

### Error: "Docker is not running"

**Solution:**
1. Start Docker Desktop
2. Wait for it to fully start
3. Run setup script again

---

### Error: "supabase command not found"

**Solution:**
```bash
# Install Supabase CLI
npm install -g supabase

# Verify installation
supabase --version
```

---

### Error: "Port already in use"

**Symptoms:**
- Can't start Supabase
- "port 54321 is already allocated"

**Solution:**

**Option 1: Stop existing Supabase**
```bash
supabase stop
supabase start
```

**Option 2: Kill process using port**
```bash
# Windows
netstat -ano | findstr :54321
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:54321 | xargs kill -9
```

---

## Performance Issues

### Slow Query Performance

**Solution:**

**Check if indexes exist:**
```sql
SELECT tablename, indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

**Analyze query performance:**
```sql
EXPLAIN ANALYZE
SELECT * FROM search_history
WHERE user_id = 'some-uuid';
```

**Update statistics:**
```sql
ANALYZE;
```

---

### High Database Size

**Solution:**

**Check table sizes:**
```sql
SELECT
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

**Run cleanup functions:**
```sql
SELECT cleanup_expired_cache();
SELECT cleanup_expired_sessions();
```

**Vacuum database:**
```sql
VACUUM ANALYZE;
```

---

## TypeScript Errors

### Error: "Property does not exist on type"

**Symptoms:**
- TypeScript errors when using Supabase client
- Type mismatches

**Solution:**

Ensure you're importing types correctly:
```typescript
import { Database } from './types/database';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient<Database>(url, key);
```

Regenerate types if schema changed:
```bash
supabase gen types typescript --local > src/types/database.ts
```

---

## Environment Variable Errors

### Error: "Missing Supabase environment variables"

**Solution:**

1. Check `.env` file exists
2. Verify variable names match:
   ```env
   VITE_SUPABASE_URL=your-url
   VITE_SUPABASE_ANON_KEY=your-key
   ```
3. Restart dev server after changes
4. For Vite, variables must start with `VITE_`

---

## Getting More Help

If your issue isn't listed here:

1. **Check Supabase Logs:**
   - Dashboard → Logs → Postgres Logs
   - Dashboard → Logs → API Logs

2. **Enable Debug Mode:**
   ```typescript
   const supabase = createClient(url, key, {
     auth: {
       debug: true,
     },
   });
   ```

3. **Check Browser Console:**
   - Look for network errors
   - Check for CORS issues

4. **Supabase Status:**
   - https://status.supabase.com

5. **Community Support:**
   - Supabase Discord: https://discord.supabase.com
   - GitHub Issues: https://github.com/supabase/supabase/issues

6. **Documentation:**
   - Supabase Docs: https://supabase.com/docs
   - pgvector Docs: https://github.com/pgvector/pgvector

---

## Quick Diagnostic Commands

Run these to diagnose issues:

```sql
-- Check extensions
SELECT * FROM pg_extension;

-- Check tables
SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- Check RLS status
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- Check active connections
SELECT count(*) FROM pg_stat_activity;

-- Check database size
SELECT pg_size_pretty(pg_database_size(current_database()));

-- Check for locks
SELECT * FROM pg_locks WHERE NOT granted;
```

---

**Last Updated:** November 15, 2024
