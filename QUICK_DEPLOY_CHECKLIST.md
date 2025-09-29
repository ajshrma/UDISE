# 🚀 Quick Deployment Checklist

## Pre-Deployment Checklist
- [ ] Code pushed to GitHub repository
- [ ] MongoDB Atlas cluster ready and accessible
- [ ] SendGrid account configured (optional)
- [ ] All local tests passing

## Backend Deployment (Render)
- [ ] Go to https://dashboard.render.com/
- [ ] Create new Web Service
- [ ] Connect GitHub repository
- [ ] Set configuration:
  - Name: `udise-dashboard-backend`
  - Runtime: `Node`
  - Build Command: `npm install`
  - Start Command: `node app.js`
- [ ] Set environment variables:
  ```
  NODE_ENV=production
  PORT=10000
  MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/udise-dashboard
  JWT_AUTH_SECRET=your-secret-key
  JWT_REFRESH_SECRET=your-refresh-secret
  JWT_AUTH_EXPIRATION=1d
  JWT_REFRESH_EXPIRATION=7d
  CLIENT_URL=https://udise-dashboard.vercel.app
  SENDGRID_API_KEY=your-key (optional)
  SENDGRID_EMAIL=your-email (optional)
  ```
- [ ] Deploy and wait for success
- [ ] Note backend URL: `https://udise-dashboard-backend.onrender.com`

## Frontend Deployment (Vercel)
- [ ] Go to https://vercel.com/dashboard
- [ ] Create new project
- [ ] Import GitHub repository
- [ ] Set configuration:
  - Framework: `Next.js`
  - Root Directory: `frontend`
  - Build Command: `npm run build`
- [ ] Set environment variable:
  ```
  NEXT_APP_SERVER_URL=https://udise-dashboard-backend.onrender.com/api/v1
  ```
- [ ] Deploy and wait for success
- [ ] Note frontend URL: `https://udise-dashboard.vercel.app`

## Post-Deployment
- [ ] Update backend CORS with frontend URL
- [ ] Test backend API: `curl https://udise-dashboard-backend.onrender.com/api/v1/schools`
- [ ] Test frontend-backend connection
- [ ] Import sample data to MongoDB
- [ ] Test all features:
  - [ ] User authentication
  - [ ] School data loading
  - [ ] Filter functionality
  - [ ] Pagination
  - [ ] Charts and analytics

## Final URLs
- **Frontend**: https://udise-dashboard.vercel.app
- **Backend**: https://udise-dashboard-backend.onrender.com

## Troubleshooting
- CORS issues → Update CLIENT_URL in Render
- API connection issues → Check NEXT_APP_SERVER_URL in Vercel
- Database issues → Verify MONGO_URI and MongoDB access
- Build failures → Check package.json and dependencies
