#!/bin/bash

# Clean Next.js cache and restart development server
echo "🧹 Cleaning Next.js cache..."

# Remove Next.js build cache
rm -rf .next

# Remove node modules cache
rm -rf node_modules/.cache

# Remove any turbo cache
rm -rf .turbo

echo "✅ Cache cleaned successfully!"
echo "🚀 Starting development server..."

# Start development server
npm run dev
