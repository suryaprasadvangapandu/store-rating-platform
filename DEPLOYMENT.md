# 🚀 Store Rating Platform - Deployment Guide

This guide will help you deploy your Store Rating Platform to production using **Render.com** (backend) and **Vercel** (frontend) - both completely FREE!

## 📋 Prerequisites

- GitHub account with your repository: `https://github.com/suryaprasadvangapandu/store-rating-platform`
- Render.com account (completely free)
- Vercel account (completely free)
- PostgreSQL database (Render provides this for free)

## 🗄️ Step 1: Deploy Backend to Render.com

### 1.1 Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with your GitHub account
3. Connect your GitHub repository

### 1.2 Deploy Backend
1. **Create New Web Service**:
   - Click "New" → "Web Service"
   - Connect your GitHub repository: `suryaprasadvangapandu/store-rating-platform`
   - Choose the repository

2. **Configure Service**:
   - **Name**: `store-rating-backend` (or any name you prefer)
   - **Environment**: `Node`
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Free` (completely free!)

3. **Add PostgreSQL Database**:
   - In your Render dashboard
   - Click "New" → "PostgreSQL"
   - **Name**: `store-rating-db`
   - **Plan**: `Free` (completely free!)
   - **Database**: `store_rating_platform`
   - Click "Create Database"

4. **Set Environment Variables**:
   Go to your web service → Environment tab and add:
   ```
   NODE_ENV=production
   JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random_123456789
   JWT_EXPIRES_IN=24h
   CLIENT_URL=https://your-frontend-url.vercel.app
   ```

5. **Database Connection**:
   Render automatically provides these variables:
   ```
   DATABASE_URL=postgresql://username:password@host:port/database
   ```
   Your `server/config/database.js` will automatically use this.

### 1.3 Run Database Schema
1. **Connect to Render PostgreSQL**:
   - Go to your PostgreSQL service in Render
   - Click "Connect" → "External Connection"
   - Use any PostgreSQL client (pgAdmin, DBeaver, or online tools)
   - Copy the contents of `server/database/schema.sql`
   - Paste and execute the SQL commands

2. **Verify Deployment**:
   - Your backend will be available at: `https://your-app-name.onrender.com`
   - Test: `https://your-app-name.onrender.com/health`

## 🎨 Step 2: Deploy Frontend to Vercel

### 2.1 Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with your GitHub account
3. Import your GitHub repository

### 2.2 Configure Frontend Deployment
1. **Import Project**:
   - Click "New Project"
   - Select `suryaprasadvangapandu/store-rating-platform`
   - Set **Root Directory** to `client`

2. **Build Settings**:
   - Framework Preset: `Create React App`
   - Build Command: `npm run build`
   - Output Directory: `build`
   - Install Command: `npm install`

3. **Environment Variables**:
   Add these environment variables:
   ```
   REACT_APP_API_URL=https://your-backend-url.onrender.com
   ```

4. **Deploy**:
   - Click "Deploy"
   - Vercel will build and deploy your frontend
   - You'll get a URL like: `https://your-app-name.vercel.app`

## 🔧 Step 3: Update Frontend API Configuration

### 3.1 Update API Base URL
You need to update the frontend to use your production backend URL.

1. **Create Environment File**:
   Create `client/.env.production`:
   ```
   REACT_APP_API_URL=https://your-backend-url.railway.app
   ```

2. **Update Axios Configuration**:
   In your frontend code, update the API base URL to use the environment variable.

### 3.2 Redeploy Frontend
1. Commit your changes to GitHub
2. Vercel will automatically redeploy with the new configuration

## 🧪 Step 4: Test Your Deployment

### 4.1 Test Backend
```bash
# Health check
curl https://your-backend-url.railway.app/health

# Test API endpoints
curl https://your-backend-url.railway.app/api/stores
```

### 4.2 Test Frontend
1. Visit your Vercel URL
2. Try registering a new user
3. Test login functionality
4. Test all three portals (Admin, User, Store Owner)

## 🔐 Step 5: Production Security Checklist

- [ ] **Strong JWT Secret**: Use a long, random JWT secret
- [ ] **HTTPS Only**: Both Railway and Vercel provide HTTPS by default
- [ ] **Environment Variables**: All secrets are in environment variables
- [ ] **CORS Configuration**: Properly configured for your frontend domain
- [ ] **Rate Limiting**: Already configured in your Express server
- [ ] **Helmet Security**: Security headers are enabled

## 📊 Step 6: Monitoring and Maintenance

### 6.1 Railway Monitoring
- Check Railway dashboard for server logs
- Monitor database usage
- Set up alerts for downtime

### 6.2 Vercel Analytics
- Enable Vercel Analytics for frontend monitoring
- Monitor build times and performance

## 🆘 Troubleshooting

### Common Issues:

1. **CORS Errors**:
   - Update `CLIENT_URL` environment variable in Railway
   - Ensure frontend URL is correct

2. **Database Connection Issues**:
   - Verify `DATABASE_URL` is set correctly
   - Check if database schema is properly imported

3. **Build Failures**:
   - Check Railway/Vercel build logs
   - Ensure all dependencies are in package.json

4. **Environment Variables**:
   - Double-check all environment variables are set
   - Restart services after adding new variables

## 🎉 Success!

Once deployed, your Store Rating Platform will be live at:
- **Frontend**: `https://your-app-name.vercel.app`
- **Backend**: `https://your-app-name.railway.app`

## 📞 Support

If you encounter issues:
1. Check Railway/Vercel logs
2. Verify environment variables
3. Test API endpoints individually
4. Check GitHub repository for latest updates

---

**Happy Deploying! 🚀**
