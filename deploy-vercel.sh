#!/bin/bash

# Frontend Deployment Script for Vercel

echo "🚀 Deploying Youth Alive Frontend to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed. Installing it now..."
    npm install -g vercel
fi

# Get backend URL from user
read -p "Enter your backend Heroku URL (e.g., https://youthalive-backend.herokuapp.com): " BACKEND_URL

if [ -z "$BACKEND_URL" ]; then
    echo "❌ Backend URL is required"
    exit 1
fi

# Create .env.production file
echo "📝 Creating production environment file..."
cat > .env.production << EOF
REACT_APP_API_URL=$BACKEND_URL
REACT_APP_NAME=Youth Alive Check-in System
REACT_APP_VERSION=1.0.0
EOF

echo "📦 Building project..."
npm run build

echo "🚀 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo "🌐 Your frontend will be available at the URL provided by Vercel"
echo "📋 Make sure to update your backend FRONTEND_URL environment variable with the Vercel URL"
