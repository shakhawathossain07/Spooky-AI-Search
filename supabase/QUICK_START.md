# 🚀 Quick Start Guide

## Local Development (5 minutes)

### 1. Install Supabase CLI
```bash
npm install -g supabase
```

### 2. Start Supabase
```bash
# Windows
.\supabase\local-setup.ps1

# macOS/Linux
./supabase/local-setup.sh
```

### 3. Update .env
Copy the API URL and anon key from the output:
```env
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=your-local-anon-key
```

### 4. Start Dev Server
```bash
npm run dev
```

## Production Deployment

### 1. Create Supabase Project
- Go to https://supabase.com
- Create new project
- Wait 2-3 minutes

### 2. Enable pgvector Extension
⚠️ **IMPORTANT: Do this first!**
- Go to Database → Extensions
- Search "pgvector" and enable it

### 3. Apply Migrations
```bash
supabase link --project-ref your-project-ref
supabase db push
```

### 4. Configure Auth
- Enable Email provider
- Enable Anonymous provider
- Set Site URL

### 5. Deploy to Netlify
```bash
netlify deploy --prod
```

## Common Commands

```bash
# View Supabase status
supabase status

# Reset database
supabase db reset

# Open Studio
supabase studio

# Stop Supabase
supabase stop
```

## Need Help?

- 📖 Full docs: `supabase/README.md`
- 🔐 Auth setup: `supabase/setup-auth.md`
- 🚀 Deployment: `supabase/DEPLOYMENT.md`
- 🔧 Troubleshooting: `supabase/TROUBLESHOOTING.md`
