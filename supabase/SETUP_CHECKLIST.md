# 📋 Supabase Setup Checklist

Use this checklist to ensure you complete all setup steps correctly.

## Local Development Setup

- [ ] **Install Supabase CLI**
  ```bash
  npm install -g supabase
  ```

- [ ] **Install Docker Desktop**
  - Download from https://docker.com
  - Start Docker Desktop

- [ ] **Run Setup Script**
  ```bash
  # Windows
  .\supabase\local-setup.ps1
  
  # macOS/Linux
  ./supabase/local-setup.sh
  ```

- [ ] **Update .env File**
  - Copy API URL and anon key from terminal output
  - Paste into `.env` file

- [ ] **Start Development Server**
  ```bash
  npm run dev
  ```

- [ ] **Test Connection**
  - Open browser to http://localhost:5173
  - Check browser console for errors

---

## Production Deployment Checklist

### Phase 1: Supabase Project Setup

- [ ] **Create Supabase Project**
  - Go to https://app.supabase.com
  - Click "New Project"
  - Choose project name and region
  - Generate strong database password
  - Wait 2-3 minutes for project creation

- [ ] **⚠️ Enable pgvector Extension (CRITICAL)**
  - Go to Database → Extensions
  - Search for "pgvector"
  - Click toggle to Enable
  - Wait for confirmation
  - **DO NOT SKIP THIS STEP!**

### Phase 2: Database Migration

- [ ] **Link Project (CLI Method)**
  ```bash
  supabase link --project-ref your-project-ref
  ```

- [ ] **Push Migrations**
  ```bash
  supabase db push
  ```

- [ ] **Verify Tables Created**
  - Go to Database → Tables
  - Confirm these tables exist:
    - [ ] users
    - [ ] search_sessions
    - [ ] search_history
    - [ ] annotations
    - [ ] cached_results
    - [ ] session_participants

- [ ] **Verify Extensions**
  - Go to Database → Extensions
  - Confirm enabled:
    - [ ] uuid-ossp
    - [ ] pgvector

### Phase 3: Authentication Setup

- [ ] **Enable Email Provider**
  - Go to Authentication → Providers
  - Find "Email" and enable it
  - Enable these options:
    - [ ] Confirm email
    - [ ] Secure email change
    - [ ] Secure password change

- [ ] **Enable Anonymous Provider**
  - Go to Authentication → Providers
  - Find "Anonymous"
  - Toggle to Enabled

- [ ] **Configure Site URL**
  - Go to Authentication → URL Configuration
  - Set Site URL: `https://yourdomain.com`

- [ ] **Add Redirect URLs**
  - Add: `https://yourdomain.com/**`
  - Add: `https://your-site.netlify.app/**`
  - Add: `http://localhost:5173/**` (for testing)

- [ ] **Configure SMTP (Production)**
  - Go to Settings → Auth
  - Scroll to SMTP Settings
  - Enter SMTP provider details
  - Test email delivery

### Phase 4: Storage Setup

- [ ] **Verify Storage Bucket**
  - Go to Storage → Buckets
  - Confirm `user-uploads` bucket exists
  - Check bucket is private (not public)

- [ ] **Test File Upload**
  - Try uploading a test file
  - Verify RLS policies work

### Phase 5: Get API Credentials

- [ ] **Copy API Credentials**
  - Go to Settings → API
  - Copy these values:
    - [ ] Project URL
    - [ ] anon public key
    - [ ] service_role key (keep secret!)

- [ ] **Save Credentials Securely**
  - Store service_role key in password manager
  - Never commit service_role key to git

### Phase 6: Netlify Deployment

- [ ] **Set Environment Variables**
  - Go to Netlify Site Settings → Environment Variables
  - Add these variables:
    - [ ] VITE_SUPABASE_URL
    - [ ] VITE_SUPABASE_ANON_KEY
    - [ ] VITE_OPENAI_API_KEY
    - [ ] VITE_SEARCH_API_KEY
    - [ ] VITE_SEARCH_API_PROVIDER
    - [ ] VITE_REDIS_URL
    - [ ] VITE_REDIS_TOKEN

- [ ] **Deploy Site**
  ```bash
  netlify deploy --prod
  ```

- [ ] **Verify Deployment**
  - Visit your Netlify URL
  - Check for errors in browser console

### Phase 7: Testing

- [ ] **Test User Signup**
  - Create a new account
  - Verify email confirmation works
  - Check user appears in Authentication → Users

- [ ] **Test User Login**
  - Sign in with created account
  - Verify session persists

- [ ] **Test Anonymous Auth**
  - Sign in anonymously
  - Verify anonymous user created

- [ ] **Test Search Functionality**
  - Perform a search
  - Verify results display
  - Check search_history table has entry

- [ ] **Test Database Access**
  - Verify RLS policies work
  - Try accessing another user's data (should fail)

### Phase 8: Monitoring & Maintenance

- [ ] **Set Up Database Cleanup**
  - Enable pg_cron extension
  - Schedule cleanup functions
  - Or set up Netlify scheduled functions

- [ ] **Configure Monitoring**
  - Go to Reports in Supabase Dashboard
  - Review metrics
  - Set up alerts

- [ ] **Enable Backups**
  - Verify daily backups are enabled (Pro plan)
  - Test restore process

- [ ] **Document Credentials**
  - Save all API keys securely
  - Document where credentials are stored
  - Share with team securely

### Phase 9: Security Review

- [ ] **Verify RLS Enabled**
  ```sql
  SELECT tablename, rowsecurity 
  FROM pg_tables 
  WHERE schemaname = 'public';
  ```
  - All should show 't' (true)

- [ ] **Test Rate Limiting**
  - Verify rate limits are configured
  - Test with multiple rapid requests

- [ ] **Review API Keys**
  - Confirm service_role key is not exposed
  - Verify anon key is used in frontend

- [ ] **Check HTTPS**
  - Verify all connections use HTTPS
  - Check SSL certificate is valid

### Phase 10: Documentation

- [ ] **Update Team Documentation**
  - Document deployment process
  - Share credentials securely
  - Document maintenance procedures

- [ ] **Create Runbook**
  - Document common issues
  - Create incident response plan
  - Document rollback procedures

---

## Common Issues Checklist

If something goes wrong, check these:

- [ ] **pgvector Error**
  - Did you enable pgvector extension BEFORE migration?
  - See `TROUBLESHOOTING.md`

- [ ] **Authentication Errors**
  - Are environment variables set correctly?
  - Is Site URL configured?
  - Are redirect URLs added?

- [ ] **Database Connection Errors**
  - Is Supabase project running?
  - Are credentials correct?
  - Check Supabase status page

- [ ] **RLS Errors**
  - Is user authenticated?
  - Are RLS policies correct?
  - Check user ID matches policy

---

## Quick Reference

**Documentation Files:**
- `README.md` - Overview and setup
- `QUICK_START.md` - Fast setup guide
- `DEPLOYMENT.md` - Detailed deployment guide
- `TROUBLESHOOTING.md` - Common issues and solutions
- `setup-auth.md` - Authentication configuration
- `database-functions.md` - Database functions reference

**Important Commands:**
```bash
# Local development
supabase start
supabase status
supabase stop
supabase db reset

# Production
supabase link --project-ref <ref>
supabase db push
supabase db diff

# Deployment
netlify deploy --prod
```

**Important URLs:**
- Supabase Dashboard: https://app.supabase.com
- Netlify Dashboard: https://app.netlify.com
- Supabase Status: https://status.supabase.com

---

## Completion

Once all checkboxes are complete:

✅ **Local Development Ready**
✅ **Production Deployed**
✅ **Authentication Configured**
✅ **Database Migrated**
✅ **Monitoring Enabled**
✅ **Security Verified**

**You're ready to build! 🎉**

---

**Need Help?**
- See `TROUBLESHOOTING.md` for common issues
- Check Supabase Discord: https://discord.supabase.com
- Review documentation in `supabase/` directory
