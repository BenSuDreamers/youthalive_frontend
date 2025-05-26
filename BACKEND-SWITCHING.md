# 🔄 Frontend Backend Switching Guide

## Quick Switch Between Local and Production Backends

### For Local Development (Backend on localhost:3000)

Edit `c:\YouthAlive\youthalive_frontend\.env.local`:

```bash
# Local Development - ACTIVE
REACT_APP_API_URL=http://localhost:3000/api

# Production - COMMENTED OUT
# REACT_APP_API_URL=https://youthalive-backend-873403ae276a.herokuapp.com/api
```

### For Production Testing (Backend on Heroku)

Edit `c:\YouthAlive\youthalive_frontend\.env.local`:

```bash
# Local Development - COMMENTED OUT
# REACT_APP_API_URL=http://localhost:3000/api

# Production - ACTIVE
REACT_APP_API_URL=https://youthalive-backend-873403ae276a.herokuapp.com/api
```

## Environment Files Explained

1. **`.env.local`** - Used for local development (npm start)
2. **`.env.production`** - Used for Vercel deployment (automatic)
3. **`.env.example`** - Template for new setups

## Current Deployment URLs

- **Frontend (Vercel):** https://youthalive-frontend.vercel.app/
- **Backend (Heroku):** https://youthalive-backend-873403ae276a.herokuapp.com/
- **Webhook URL:** https://youthalive-backend-873403ae276a.herokuapp.com/api/webhooks/jotform

## After Switching

1. **Restart the development server:**
   ```bash
   cd youthalive_frontend
   npm start
   ```

2. **Clear browser cache** if needed (Ctrl+Shift+R)

## Status Check Commands

```bash
# Test local backend
curl http://localhost:3000/health

# Test Heroku backend  
curl https://youthalive-backend-873403ae276a.herokuapp.com/health

# Test frontend
curl https://youthalive-frontend.vercel.app/
```
