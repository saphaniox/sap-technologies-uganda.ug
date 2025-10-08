# API Configuration Guide

## Overview
This application uses a centralized API service (`src/services/api.js`) to communicate with the backend server hosted on Render.com.

## Backend API URL
**Production:** `https://sap-technologies-ug.onrender.com`

## Configuration Files

### 1. Environment Variables

#### `.env.development` (Local Development)
```bash
VITE_API_URL=
```
- Empty value forces Vite to use the proxy configuration
- Avoids CORS issues during development
- All `/api/*` requests are proxied to the backend

#### `.env.production` (Production Build)
```bash
VITE_API_URL=https://sap-technologies-ug.onrender.com
```
- Direct connection to production backend
- Used when building for deployment

### 2. Vite Proxy Configuration (`vite.config.js`)

```javascript
proxy: {
  "/api": {
    target: "https://sap-technologies-ug.onrender.com",
    changeOrigin: true,
    secure: false,
    ws: true
  }
}
```

**Purpose:**
- Proxies local development requests to production backend
- Prevents CORS errors during development
- Enables WebSocket connections

### 3. API Service (`src/services/api.js`)

The `ApiService` class handles all API communication:

#### Key Features:
- ✅ Environment-aware URL selection
- ✅ Automatic request/response handling
- ✅ Error handling and logging
- ✅ Authentication token management
- ✅ File upload support (FormData)
- ✅ CORS handling

#### How It Works:
1. **Development Mode** (localhost):
   - Uses empty baseURL (`""`)
   - Requests go through Vite proxy
   - Example: `GET /api/partners` → proxied to `https://sap-technologies-ug.onrender.com/api/partners`

2. **Production Mode**:
   - Uses full backend URL
   - Direct requests to backend
   - Example: `GET /api/partners` → `https://sap-technologies-ug.onrender.com/api/partners`

## API Endpoints Used by Components

### Partners (`src/components/Partners.jsx`)
- `GET /api/partners` - Fetch all partners
- `POST /api/partners` - Create new partner
- `PUT /api/partners/:id` - Update partner
- `DELETE /api/partners/:id` - Delete partner

### Products (`src/components/Products.jsx`)
- `GET /api/products` - Fetch all products
- `GET /api/products/categories` - Fetch product categories
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `POST /api/product-inquiry` - Submit product inquiry

### Services (`src/components/Services.jsx`)
- `GET /api/services` - Fetch all services
- `POST /api/services` - Create new service
- `PUT /api/services/:id` - Update service
- `DELETE /api/services/:id` - Delete service
- `POST /api/service-quote` - Request service quote

### Portfolio/Projects (`src/components/Portfolio.jsx`)
- `GET /api/projects` - Fetch all projects
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Awards (`src/components/Awards.jsx`)
- `GET /api/awards` - Fetch all awards
- `POST /api/awards` - Create new award
- `PUT /api/awards/:id` - Update award
- `DELETE /api/awards/:id` - Delete award

### Authentication (`src/components/AuthModal.jsx`, `src/components/Account.jsx`)
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Admin (`src/components/AdminDashboard.jsx`)
- `GET /api/admin/users` - Fetch all users
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/stats` - Get dashboard statistics

### Contact (`src/components/Contact.jsx`)
- `POST /api/contact` - Submit contact form

### Newsletter (`src/components/Newsletter.jsx`)
- `POST /api/newsletter/subscribe` - Subscribe to newsletter

### Partner Requests (`src/components/PartnerRequestForm.jsx`)
- `POST /api/partner-requests` - Submit partnership request

### Certificate Verification (`src/pages/CertificateVerify.jsx`)
- `GET /api/certificates/verify/:code` - Verify certificate

## Error Handling

All API calls include error handling:
- Network errors
- Server errors (5xx)
- Client errors (4xx)
- Authentication errors (401, 403)

Error messages are user-friendly and provide guidance:
- "failed to load partners, please refresh the page"
- "Failed to load products. Please try again later."
- etc.

## Testing the API Configuration

### Development Testing
1. Start the development server:
   ```bash
   npm run dev
   ```
2. Open browser console (F12)
3. Check for API Configuration log:
   ```
   API Configuration: {
     baseURL: "",
     isLocalhost: true,
     env: "development",
     envApiUrl: undefined
   }
   ```
4. Make API calls (e.g., load partners page)
5. Check Network tab - requests should go to `/api/partners`

### Production Testing
1. Build the application:
   ```bash
   npm run build
   ```
2. Preview the build:
   ```bash
   npm run preview
   ```
3. Check console for API Configuration
4. Verify requests go directly to `https://sap-technologies-ug.onrender.com`

## Changing the API URL

### For Development:
Update `vite.config.js`:
```javascript
proxy: {
  "/api": {
    target: "YOUR_NEW_BACKEND_URL",
    // ...
  }
}
```

### For Production:
Update `.env.production`:
```bash
VITE_API_URL=YOUR_NEW_BACKEND_URL
```

### For Both:
Update fallback in `src/services/api.js`:
```javascript
return import.meta.env.VITE_API_URL || "YOUR_NEW_BACKEND_URL";
```

## Security Considerations

1. **Authentication:**
   - JWT tokens stored in cookies
   - Tokens included in requests automatically
   - Secure: true in production

2. **CORS:**
   - Backend must allow frontend domain
   - Proxy handles CORS in development

3. **Environment Variables:**
   - Never commit `.env.local` to version control
   - Use `.env.example` as template
   - Set production variables in hosting platform

## Troubleshooting

### Issue: CORS Errors in Development
**Solution:** Ensure `VITE_API_URL` is empty in `.env.development`

### Issue: 404 Errors
**Solution:** Check that backend API is running and endpoint exists

### Issue: Network Errors
**Solution:** 
- Verify backend URL is correct
- Check if backend server is running
- Check network connectivity

### Issue: Authentication Errors
**Solution:**
- Clear cookies
- Check if token is expired
- Verify backend authentication setup

## Architecture Diagram

```
┌─────────────────┐
│  React Frontend │
│   (Port 5174)   │
└────────┬────────┘
         │
         ├─── Development Mode ───┐
         │                        │
         │                   ┌────▼─────┐
         │                   │   Vite   │
         │                   │  Proxy   │
         │                   └────┬─────┘
         │                        │
         └─── Production Mode ────┤
                                  │
                            ┌─────▼─────┐
                            │  Backend  │
                            │  Render   │
                            │   Server  │
                            └───────────┘
```

## Components Using API Service

✅ About.jsx
✅ Account.jsx
✅ AdminDashboard.jsx
✅ AuthModal.jsx
✅ Awards.jsx
✅ AwardsAdmin.jsx
✅ Contact.jsx
✅ ForgotPassword.jsx
✅ Newsletter.jsx
✅ PartnerForm.jsx
✅ PartnerRequestForm.jsx
✅ Partners.jsx
✅ Portfolio.jsx
✅ ProductForm.jsx
✅ ProductInquiryForm.jsx
✅ Products.jsx
✅ ServiceForm.jsx
✅ ServiceQuoteForm.jsx
✅ Services.jsx
✅ CertificateVerify.jsx

All components import and use: `import apiService from '../services/api'`

## Summary

Your application has a well-configured API setup:
- ✅ Centralized API service
- ✅ Environment-based configuration
- ✅ Development proxy for CORS
- ✅ Production direct connection
- ✅ Comprehensive error handling
- ✅ All components use the same API service
- ✅ Consistent endpoint structure

The API is fully configured and ready to use!
