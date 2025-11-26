# Production Deployment Guide

This guide covers deploying Spooky AI Search to production with Supabase and Netlify.

## Prerequisites

- Supabase account (https://supabase.com)
- Netlify account (https://netlify.com)
- GitHub repository with your code
- Domain name (optional)

## Step 1: Create Supabase Project

1. Go to https://app.supabase.com
2. Click "New Project"
3. Fill in project details:
   - **Name**: spooky-ai-search-prod
   - **Database Password**: Generate a strong password (save it securely)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Pro (recommended for 10,000+ concurrent users)

4. Wait for project to be created (2-3 minutes)

## Step 2: Enable Required Extensions

**IMPORTANT**: Enable pgvector extension before applying migrations.

1. Go to Supabase Dashboard → **Database** → **Extensions**
2. Search for "pgvector"
3. Click the toggle to **Enable** pgvector
4. Wait for confirmation (should be instant)

## Step 3: Apply Database Migrations

### Option A: Using Supabase CLI (Recommended)

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Push migrations to production
supabase db push

# Verify migrations
supabase db diff
```

### Option B: Using SQL Editor

1. **First, enable pgvector** (see Step 2 above)
2. Go to Supabase Dashboard → **SQL Editor**
3. Copy contents of `supabase/migrations/20241113000000_initial_schema.sql`
4. Paste into SQL Editor
5. Click "Run"
6. Verify all tables are created in **Database** → **Tables**

**Note**: If you get a pgvector error, make sure you enabled the extension in Step 2.

## Step 4: Configure Authentication

1. Go to **Authentication** → **Providers**

2. Enable **Email** provider:
   - ✅ Enable Email provider
   - ✅ Confirm email
   - ✅ Secure email change
   - ✅ Secure password change

3. Enable **Anonymous** provider:
   - Toggle to Enabled

4. Configure **SMTP Settings** (Settings → Auth):
   ```
   Host: smtp.sendgrid.net (or your provider)
   Port: 587
   Username: apikey
   Password: your-sendgrid-api-key
   Sender email: noreply@yourdomain.com
   Sender name: Spooky AI Search
   ```

5. Set **Site URL** (Authentication → URL Configuration):
   ```
   https://yourdomain.com
   ```

6. Add **Redirect URLs**:
   ```
   https://yourdomain.com/**
   https://your-site.netlify.app/**
   ```

## Step 5: Configure Storage

Storage bucket is automatically created by migration, but verify:

1. Go to **Storage** → **Buckets**
2. Verify `user-uploads` bucket exists
3. Check policies are enabled (should be automatic)

## Step 6: Get API Credentials

1. Go to **Settings** → **API**
2. Copy the following:
   - **Project URL**: `https://your-project.supabase.co`
   - **anon public key**: `eyJ...` (safe to expose in frontend)
   - **service_role key**: `eyJ...` (keep secret, use in backend only)

## Step 7: Deploy to Netlify

### Option A: Using Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize site
netlify init

# Set environment variables
netlify env:set VITE_SUPABASE_URL "https://your-project.supabase.co"
netlify env:set VITE_SUPABASE_ANON_KEY "your-anon-key"
netlify env:set VITE_OPENAI_API_KEY "your-openai-key"
netlify env:set VITE_SEARCH_API_KEY "your-search-api-key"
netlify env:set VITE_SEARCH_API_PROVIDER "brave"
netlify env:set VITE_REDIS_URL "your-redis-url"
netlify env:set VITE_REDIS_TOKEN "your-redis-token"

# Deploy
netlify deploy --prod
```

### Option B: Using Netlify Dashboard

1. Go to https://app.netlify.com
2. Click "Add new site" → "Import an existing project"
3. Connect to your GitHub repository
4. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Functions directory**: `netlify/functions`

5. Add environment variables (Site settings → Environment variables):
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   VITE_OPENAI_API_KEY=your-openai-key
   VITE_SEARCH_API_KEY=your-search-api-key
   VITE_SEARCH_API_PROVIDER=brave
   VITE_REDIS_URL=your-redis-url
   VITE_REDIS_TOKEN=your-redis-token
   ```

6. Click "Deploy site"

## Step 8: Configure Custom Domain (Optional)

### In Netlify:

1. Go to Site settings → Domain management
2. Click "Add custom domain"
3. Enter your domain: `yourdomain.com`
4. Follow DNS configuration instructions

### Update Supabase:

1. Go to Authentication → URL Configuration
2. Update Site URL to your custom domain
3. Update Redirect URLs to include custom domain

## Step 9: Set Up Database Maintenance

### Option A: Using pg_cron (Recommended)

Enable pg_cron extension in Supabase:

```sql
-- Enable pg_cron
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule cache cleanup (every hour)
SELECT cron.schedule(
  'cleanup-cache-hourly',
  '0 * * * *',
  'SELECT cleanup_expired_cache();'
);

-- Schedule session cleanup (daily at 2 AM)
SELECT cron.schedule(
  'cleanup-sessions-daily',
  '0 2 * * *',
  'SELECT cleanup_expired_sessions();'
);

-- View scheduled jobs
SELECT * FROM cron.job;
```

### Option B: Using Netlify Scheduled Functions

Create `netlify/functions/scheduled-cleanup.ts`:

```typescript
import { schedule } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const handler = schedule('0 * * * *', async () => {
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Cleanup expired cache
  await supabase.rpc('cleanup_expired_cache');
  
  // Cleanup expired sessions (once per day)
  const hour = new Date().getHours();
  if (hour === 2) {
    await supabase.rpc('cleanup_expired_sessions');
  }

  return {
    statusCode: 200,
  };
});

export { handler };
```

## Step 10: Configure Monitoring

### Supabase Monitoring:

1. Go to **Reports** in Supabase Dashboard
2. Monitor:
   - Database size
   - API requests
   - Auth users
   - Storage usage

### Set Up Alerts:

1. Go to **Settings** → **Alerts**
2. Configure alerts for:
   - Database size > 80%
   - API requests > threshold
   - Error rate > 1%

### Netlify Monitoring:

1. Go to Site → Analytics
2. Monitor:
   - Page views
   - Function invocations
   - Build times
   - Bandwidth usage

## Step 11: Security Hardening

### 1. Enable Database Backups

Supabase Pro includes daily backups. Verify:
- Go to **Settings** → **Database**
- Check backup schedule
- Test restore process

### 2. Configure Rate Limiting

In Supabase Dashboard:
- Go to **Authentication** → **Rate Limits**
- Set appropriate limits for your use case

### 3. Review RLS Policies

```sql
-- Verify RLS is enabled on all tables
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Should all show 't' (true) for rowsecurity
```

### 4. Rotate API Keys

Set up key rotation schedule:
- Service role key: Every 90 days
- SMTP credentials: Every 90 days
- External API keys: Per provider recommendations

### 5. Enable SSL/TLS

- Supabase: TLS 1.3 enabled by default
- Netlify: HTTPS enabled by default
- Verify all connections use HTTPS

## Step 12: Performance Optimization

### 1. Enable Connection Pooling

Supabase Pro includes Supavisor (connection pooler):
- Go to **Settings** → **Database**
- Enable connection pooling
- Use pooler connection string in edge functions

### 2. Configure CDN Caching

In `netlify.toml`:

```toml
[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.css"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### 3. Optimize Database

```sql
-- Create additional indexes if needed
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_custom 
ON table_name(column_name);

-- Analyze tables
ANALYZE;

-- Check slow queries
SELECT * FROM pg_stat_statements 
ORDER BY total_exec_time DESC 
LIMIT 10;
```

## Step 13: Testing Production

### 1. Smoke Tests

- [ ] User signup works
- [ ] User login works
- [ ] Anonymous auth works
- [ ] Search functionality works
- [ ] Results display correctly
- [ ] Caching works
- [ ] Real-time collaboration works
- [ ] File uploads work

### 2. Load Testing

Use tools like:
- Apache Bench (ab)
- k6
- Artillery

Example with k6:

```javascript
import http from 'k6/http';
import { check } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 100 },
    { duration: '5m', target: 1000 },
    { duration: '2m', target: 0 },
  ],
};

export default function () {
  let res = http.get('https://yourdomain.com');
  check(res, { 'status was 200': (r) => r.status == 200 });
}
```

### 3. Security Testing

- [ ] SQL injection protection (RLS)
- [ ] XSS protection
- [ ] CSRF protection
- [ ] Rate limiting works
- [ ] Authentication required where needed
- [ ] File upload restrictions work

## Troubleshooting

### Database Connection Issues

```sql
-- Check active connections
SELECT count(*) FROM pg_stat_activity;

-- Check connection limit
SHOW max_connections;

-- Kill idle connections
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE state = 'idle' 
AND state_change < NOW() - INTERVAL '10 minutes';
```

### Migration Failures

```bash
# Check migration status
supabase migration list

# Rollback last migration
supabase db rollback

# Reapply migrations
supabase db push
```

### Performance Issues

1. Check database size: Settings → Database
2. Review slow queries: Reports → Performance
3. Check API usage: Reports → API
4. Monitor function logs: Netlify → Functions

## Rollback Plan

If deployment fails:

1. **Netlify**: Deploy previous version
   ```bash
   netlify rollback
   ```

2. **Database**: Restore from backup
   - Go to Settings → Database → Backups
   - Select backup to restore
   - Confirm restoration

3. **Verify**: Run smoke tests

## Post-Deployment Checklist

- [ ] All environment variables set
- [ ] Database migrations applied
- [ ] Authentication configured
- [ ] Storage buckets created
- [ ] Custom domain configured (if applicable)
- [ ] SSL/TLS enabled
- [ ] Monitoring configured
- [ ] Alerts set up
- [ ] Backups verified
- [ ] Rate limiting configured
- [ ] Smoke tests passed
- [ ] Load tests passed
- [ ] Documentation updated

## Maintenance Schedule

**Daily:**
- Monitor error logs
- Check system health dashboard

**Weekly:**
- Review performance metrics
- Check database size
- Review security logs

**Monthly:**
- Update dependencies
- Review and optimize slow queries
- Test backup restoration
- Review and update documentation

**Quarterly:**
- Rotate API keys
- Security audit
- Performance optimization review
- Capacity planning

## Support Resources

- Supabase Support: https://supabase.com/support
- Netlify Support: https://www.netlify.com/support/
- Community Discord: [Your Discord link]
- Documentation: [Your docs link]

## Emergency Contacts

- DevOps Lead: [Contact info]
- Database Admin: [Contact info]
- Security Team: [Contact info]
