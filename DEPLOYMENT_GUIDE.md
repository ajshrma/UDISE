# 🚀 UDISE Dashboard Deployment Guide

This guide will walk you through deploying your UDISE Dashboard to production using Render (backend) and Vercel (frontend).

## 📋 Prerequisites

- GitHub repository with your code
- MongoDB Atlas account and cluster
- Render account (free tier available)
- Vercel account (free tier available)
- SendGrid account (for email functionality)

## 🎯 Deployment Architecture

```
Frontend (Next.js) → Vercel → API Calls → Backend (Express) → Render → MongoDB Atlas
```

---

## 🖥️ PHASE 1: BACKEND DEPLOYMENT (Render)

### Step 1: Prepare GitHub Repository

1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

### Step 2: Deploy to Render

1. **Go to [Render Dashboard](https://dashboard.render.com/)**
2. **Click "New +" → "Web Service"**
3. **Connect your GitHub repository**
4. **Configure the service:**

   **Basic Settings:**
   - **Name**: `udise-dashboard-backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node app.js`

   **Environment Variables:**
   ```
   NODE_ENV=production
   PORT=10000
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/udise-dashboard
   JWT_AUTH_SECRET=your-super-secret-jwt-auth-key-here
   JWT_REFRESH_SECRET=your-super-secret-jwt-refresh-key-here
   JWT_AUTH_EXPIRATION=1d
   JWT_REFRESH_EXPIRATION=7d
   CLIENT_URL=https://udise-dashboard.vercel.app
   SENDGRID_API_KEY=your-sendgrid-api-key
   SENDGRID_EMAIL=your-email@domain.com
   ```

5. **Click "Create Web Service"**
6. **Wait for deployment to complete**
7. **Note your backend URL**: `https://udise-dashboard-backend.onrender.com`

---

## 🌐 PHASE 2: FRONTEND DEPLOYMENT (Vercel)

### Step 1: Prepare Environment Variables

1. **Create `.env.production` file in frontend directory:**
   ```bash
   NEXT_PUBLIC_SERVER_URL=https://udise-dashboard-backend.onrender.com/api/v1
   ```

### Step 2: Deploy to Vercel

1. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**
2. **Click "New Project"**
3. **Import your GitHub repository**
4. **Configure the project:**

   **Project Settings:**
   - **Framework Preset**: `Next.js`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

   **Environment Variables:**
   ```
   NEXT_PUBLIC_SERVER_URL=https://udise-dashboard-backend.onrender.com/api/v1
   ```

5. **Click "Deploy"**
6. **Wait for deployment to complete**
7. **Note your frontend URL**: `https://udise-dashboard.vercel.app`

---

## 🔧 PHASE 3: CONFIGURATION & TESTING

### Step 1: Update Backend CORS

1. **Go to Render Dashboard**
2. **Navigate to your backend service**
3. **Update environment variable:**
   ```
   CLIENT_URL=https://udise-dashboard.vercel.app
   ```
4. **Redeploy the service**

### Step 2: Test API Connectivity

1. **Test backend health:**
   ```bash
   curl https://udise-dashboard-backend.onrender.com/api/v1/schools
   ```

2. **Test frontend-backend connection:**
   - Visit your Vercel URL
   - Try to load schools data
   - Check browser network tab for API calls

### Step 3: Database Setup

1. **Import sample data to your MongoDB Atlas cluster:**
   ```bash
   # Run this locally with your production MONGO_URI
   cd backend
   node quick-fix-data.js
   ```

---

## 🔒 PHASE 4: SECURITY & OPTIMIZATION

### Security Checklist

- ✅ **Environment Variables**: All secrets are properly configured
- ✅ **CORS**: Properly configured for your domain
- ✅ **JWT Secrets**: Strong, unique secrets for production
- ✅ **MongoDB**: Database access restricted to Render IPs
- ✅ **HTTPS**: Both frontend and backend use HTTPS

### Performance Optimization

- ✅ **Frontend**: Next.js optimized build
- ✅ **Backend**: Proper error handling and logging
- ✅ **Database**: MongoDB Atlas with proper indexing
- ✅ **CDN**: Vercel's global CDN for frontend assets

---

## 📊 PHASE 5: MONITORING & MAINTENANCE

### Monitoring Setup

1. **Render Monitoring:**
   - Check Render dashboard for backend health
   - Monitor logs for errors
   - Set up alerts for downtime

2. **Vercel Analytics:**
   - Enable Vercel Analytics
   - Monitor frontend performance
   - Track user interactions

3. **MongoDB Atlas:**
   - Monitor database performance
   - Set up alerts for connection issues
   - Regular backup verification

### Maintenance Tasks

- **Weekly**: Check deployment health
- **Monthly**: Update dependencies
- **Quarterly**: Security audit and updates

---

## 🚨 TROUBLESHOOTING

### Common Issues

**1. CORS Errors:**
```
Solution: Update CLIENT_URL in Render environment variables
```

**2. API Connection Issues:**
```
Solution: Check NEXT_PUBLIC_SERVER_URL in Vercel environment variables
```

**3. Database Connection Issues:**
```
Solution: Verify MONGO_URI and MongoDB Atlas network access
```

**4. Build Failures:**
```
Solution: Check package.json scripts and dependencies
```

### Debug Commands

```bash
# Test backend locally
curl http://localhost:5000/api/v1/schools

# Test frontend locally
npm run dev

# Check environment variables
echo $NEXT_PUBLIC_SERVER_URL
```

---

## 📝 DEPLOYMENT CHECKLIST

### Pre-Deployment
- [ ] Code pushed to GitHub
- [ ] Environment variables prepared
- [ ] MongoDB Atlas cluster ready
- [ ] SendGrid account configured

### Backend Deployment
- [ ] Render service created
- [ ] Environment variables set
- [ ] Deployment successful
- [ ] Health check passed

### Frontend Deployment
- [ ] Vercel project created
- [ ] Environment variables set
- [ ] Deployment successful
- [ ] API connectivity tested

### Post-Deployment
- [ ] CORS configuration updated
- [ ] Sample data imported
- [ ] End-to-end testing completed
- [ ] Monitoring setup verified

---

## 🎉 SUCCESS!

Your UDISE Dashboard should now be live at:
- **Frontend**: https://udise-dashboard.vercel.app
- **Backend**: https://udise-dashboard-backend.onrender.com

### Next Steps
1. Share your deployed application
2. Set up custom domains (optional)
3. Configure CI/CD for automatic deployments
4. Set up monitoring and alerts

---

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Review deployment logs in Render/Vercel dashboards
3. Verify environment variables are correctly set
4. Test API endpoints individually

**Happy Deploying! 🚀**
