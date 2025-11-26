# Spooky AI Search - Local Supabase Setup Script (PowerShell)
# This script helps you set up Supabase locally for development

Write-Host "🎃 Spooky AI Search - Local Supabase Setup" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Supabase CLI is installed
$supabaseCmd = Get-Command supabase -ErrorAction SilentlyContinue
if (-not $supabaseCmd) {
    Write-Host "❌ Supabase CLI is not installed." -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install it first:"
    Write-Host "  npm install -g supabase"
    Write-Host ""
    Write-Host "Or visit: https://supabase.com/docs/guides/cli"
    exit 1
}

Write-Host "✅ Supabase CLI found" -ForegroundColor Green
Write-Host ""

# Check if Docker is running
try {
    docker info | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "❌ Docker is not running." -ForegroundColor Red
    Write-Host ""
    Write-Host "Please start Docker Desktop and try again."
    exit 1
}

# Initialize Supabase if not already initialized
if (-not (Test-Path ".supabase")) {
    Write-Host "📦 Initializing Supabase..." -ForegroundColor Yellow
    supabase init
    Write-Host "✅ Supabase initialized" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "✅ Supabase already initialized" -ForegroundColor Green
    Write-Host ""
}

# Start Supabase
Write-Host "🚀 Starting Supabase..." -ForegroundColor Yellow
supabase start

Write-Host ""
Write-Host "✅ Supabase is running!" -ForegroundColor Green
Write-Host ""

# Get the status
Write-Host "📊 Getting connection details..." -ForegroundColor Yellow
supabase status

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "🎉 Setup Complete!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Copy the API URL and anon key from above"
Write-Host "2. Update your .env file with these values:"
Write-Host "   VITE_SUPABASE_URL=<API URL>"
Write-Host "   VITE_SUPABASE_ANON_KEY=<anon key>"
Write-Host ""
Write-Host "3. Start your development server:"
Write-Host "   npm run dev"
Write-Host ""
Write-Host "Useful commands:"
Write-Host "  supabase status     - View connection details"
Write-Host "  supabase stop       - Stop Supabase"
Write-Host "  supabase db reset   - Reset database and apply migrations"
Write-Host "  supabase studio     - Open Supabase Studio in browser"
Write-Host ""
