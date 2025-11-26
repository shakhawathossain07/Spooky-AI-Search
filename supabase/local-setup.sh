#!/bin/bash

# Spooky AI Search - Local Supabase Setup Script
# This script helps you set up Supabase locally for development

set -e

echo "🎃 Spooky AI Search - Local Supabase Setup"
echo "=========================================="
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed."
    echo ""
    echo "Please install it first:"
    echo "  npm install -g supabase"
    echo ""
    echo "Or visit: https://supabase.com/docs/guides/cli"
    exit 1
fi

echo "✅ Supabase CLI found"
echo ""

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker is not running."
    echo ""
    echo "Please start Docker Desktop and try again."
    exit 1
fi

echo "✅ Docker is running"
echo ""

# Initialize Supabase if not already initialized
if [ ! -d ".supabase" ]; then
    echo "📦 Initializing Supabase..."
    supabase init
    echo "✅ Supabase initialized"
    echo ""
else
    echo "✅ Supabase already initialized"
    echo ""
fi

# Start Supabase
echo "🚀 Starting Supabase..."
supabase start

echo ""
echo "✅ Supabase is running!"
echo ""

# Get the status
echo "📊 Getting connection details..."
supabase status

echo ""
echo "=========================================="
echo "🎉 Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Copy the API URL and anon key from above"
echo "2. Update your .env file with these values:"
echo "   VITE_SUPABASE_URL=<API URL>"
echo "   VITE_SUPABASE_ANON_KEY=<anon key>"
echo ""
echo "3. Start your development server:"
echo "   npm run dev"
echo ""
echo "Useful commands:"
echo "  supabase status     - View connection details"
echo "  supabase stop       - Stop Supabase"
echo "  supabase db reset   - Reset database and apply migrations"
echo "  supabase studio     - Open Supabase Studio in browser"
echo ""
