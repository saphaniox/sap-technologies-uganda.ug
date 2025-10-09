# CORS Error Fix Guide

## 🔴 Error Explanation

**Error:** `CORS: Origin http://localhost:5174 not allowed`

**What it means:**
- Your frontend (React) is running on `localhost:5174`
- Your backend API is on `sap-technologies-ug.onrender.com`
- The backend server is blocking requests from localhost

## ✅ Solution: Update Backend CORS Configuration

You need to update your backend server on Render.com to allow requests from your development and production origins.

### If Using Express.js Backend:

1. **Install CORS package** (if not already installed):
```bash
npm install cors
```

2. **Update your backend server file** (usually `server.js` or `app.js`):

```javascript
const express = require('express');
const cors = require('cors');

const app = express();

// CORS Configuration
const allowedOrigins = [
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
  'https://sap-technologies-official-643bp84hm-saphanioxs-projects.vercel.app',
  'https://sap-technologies-official.vercel.app',
  // Add your custom domain when you get one
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `The CORS policy for this site does not allow access from origin ${origin}`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true, // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rest of your server code...
```

### Alternative: Simple CORS Configuration

If you want to allow all origins during development (less secure):

```javascript
const cors = require('cors');

// Development - Allow all
if (process.env.NODE_ENV === 'development') {
  app.use(cors({
    origin: true,
    credentials: true
  }));
} else {
  // Production - Specific origins
  app.use(cors({
    origin: [
      'https://sap-technologies-official-643bp84hm-saphanioxs-projects.vercel.app',
      'https://sap-technologies-official.vercel.app'
    ],
    credentials: true
  }));
}
```

## 🔧 Frontend Configuration (Already Done!)

Your frontend is already configured correctly:

1. **`.env.development`** - Empty VITE_API_URL to use proxy ✅
2. **`vite.config.js`** - Proxy configured ✅
3. **`src/services/api.js`** - Auto-detects environment ✅

## 📝 Steps to Fix:

1. **Access your backend code** on Render.com or your repository
2. **Update CORS configuration** as shown above
3. **Commit and push** the backend changes
4. **Redeploy backend** on Render.com
5. **Restart your frontend** dev server

## 🧪 Testing

After updating the backend:

1. Open browser console (F12)
2. Try logging in or making API requests
3. You should see:
   - ✅ No CORS errors
   - ✅ Successful API responses
   - ✅ Console log: `API Configuration: { baseURL: "", isLocalhost: true }`

## 🌐 For Production (Vercel)

Your Vercel deployment should work fine because:
- Production uses direct API calls (not proxy)
- Backend should allow Vercel domain
- Environment variable `VITE_API_URL` handles this

## ⚡ Quick Test

To verify proxy is working, check browser console:
```javascript
// Should log empty string in development
console.log('API Base URL:', apiService.baseURL);
```

## 📞 If You Don't Have Backend Access

Contact your backend developer and share:
1. This document
2. The allowed origins list:
   - `http://localhost:5174`
   - `http://localhost:5175`
   - `http://localhost:5176`
   - Your Vercel production URL

## 🎯 Summary

**Root Cause:** Backend CORS policy doesn't allow localhost origins

**Solution:** Update backend CORS to allow development and production origins

**Status:** Frontend is configured correctly ✅ - Backend needs update ⚠️
