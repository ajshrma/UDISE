#!/bin/bash

# Frontend Deployment Script for Vercel
echo "🚀 Deploying UDISE Dashboard Frontend to Vercel..."

# Check if we're in the right directory
if [ ! -f "frontend/package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "✅ Frontend files found"

# Check if frontend has required files
echo "🔍 Checking frontend configuration..."

if [ ! -f "frontend/package.json" ]; then
    echo "❌ Error: frontend/package.json not found"
    exit 1
fi

if [ ! -d "frontend/src" ]; then
    echo "❌ Error: frontend/src directory not found"
    exit 1
fi

echo "✅ Frontend configuration looks good"

# Display deployment instructions
echo ""
echo "📋 MANUAL DEPLOYMENT STEPS:"
echo "1. Go to https://vercel.com/dashboard"
echo "2. Click 'New Project'"
echo "3. Import your GitHub repository"
echo "4. Configure project:"
echo "   - Framework Preset: Next.js"
echo "   - Root Directory: frontend"
echo "   - Build Command: npm run build"
echo "   - Output Directory: .next"
echo "5. Set environment variables:"
echo "   - NEXT_PUBLIC_API_URL=https://udise-dashboard-backend.onrender.com/api/v1"
echo "6. Click 'Deploy'"
echo ""
echo "🔗 Your frontend will be available at:"
echo "   https://udise-dashboard.vercel.app"
echo ""
echo "📖 For detailed instructions, see DEPLOYMENT_GUIDE.md"
