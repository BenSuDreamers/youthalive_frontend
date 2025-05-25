# Frontend Deployment Script for Vercel (PowerShell)

Write-Host "🚀 Deploying Youth Alive Frontend to Vercel..." -ForegroundColor Green

# Check if Vercel CLI is installed
try {
    vercel --version | Out-Null
} catch {
    Write-Host "❌ Vercel CLI is not installed. Installing it now..." -ForegroundColor Yellow
    npm install -g vercel
}

# Get backend URL from user
$BACKEND_URL = Read-Host "Enter your backend Heroku URL (e.g., https://youthalive-backend.herokuapp.com)"

if ([string]::IsNullOrEmpty($BACKEND_URL)) {
    Write-Host "❌ Backend URL is required" -ForegroundColor Red
    exit 1
}

# Create .env.production file
Write-Host "📝 Creating production environment file..." -ForegroundColor Blue
@"
REACT_APP_API_URL=$BACKEND_URL
REACT_APP_NAME=Youth Alive Check-in System
REACT_APP_VERSION=1.0.0
"@ | Out-File -FilePath ".env.production" -Encoding UTF8

Write-Host "📦 Building project..." -ForegroundColor Blue
npm run build

Write-Host "🚀 Deploying to Vercel..." -ForegroundColor Blue
vercel --prod

Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host "🌐 Your frontend will be available at the URL provided by Vercel" -ForegroundColor Cyan
Write-Host "📋 Make sure to update your backend FRONTEND_URL environment variable with the Vercel URL" -ForegroundColor Cyan
