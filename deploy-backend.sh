#!/bin/bash

# Backend Deployment Script for Render
echo "🚀 Deploying UDISE Dashboard Backend to Render..."

# Check if we're in the right directory
if [ ! -f "backend/package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "✅ Backend files found"

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📝 Initializing git repository..."
    git init
    git add .
    git commit -m "Initial commit for deployment"
fi

# Check if backend has required files
echo "🔍 Checking backend configuration..."

if [ ! -f "backend/package.json" ]; then
    echo "❌ Error: backend/package.json not found"
    exit 1
fi

if [ ! -f "backend/app.js" ]; then
    echo "❌ Error: backend/app.js not found"
    exit 1
fi

echo "✅ Backend configuration looks good"

# Display deployment instructions
echo ""
echo "📋 MANUAL DEPLOYMENT STEPS:"
echo "1. Go to https://dashboard.render.com/"
echo "2. Click 'New +' → 'Web Service'"
echo "3. Connect your GitHub repository"
echo "4. Configure service:"
echo "   - Name: udise-dashboard-backend"
echo "   - Runtime: Node"
echo "   - Build Command: npm install"
echo "   - Start Command: node app.js"
echo "5. Set environment variables (see DEPLOYMENT_GUIDE.md)"
echo "6. Click 'Create Web Service'"
echo ""
echo "🔗 Your backend will be available at:"
echo "   https://udise-dashboard-backend.onrender.com"
echo ""
echo "📖 For detailed instructions, see DEPLOYMENT_GUIDE.md"
