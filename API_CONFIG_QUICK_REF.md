# Quick API Configuration Reference

## 🎯 Current Setup Status: ✅ FULLY CONFIGURED

### Backend API
```
Production: https://sap-technologies-ug.onrender.com
```

### Configuration Files

| File | Purpose | Current Value |
|------|---------|---------------|
| `.env.development` | Local dev | `VITE_API_URL=` (empty - uses proxy) |
| `.env.production` | Production build | `VITE_API_URL=https://sap-technologies-ug.onrender.com` |
| `vite.config.js` | Dev proxy | Target: `https://sap-technologies-ug.onrender.com` |
| `src/services/api.js` | API service | Fallback: `https://sap-technologies-ug.onrender.com` |

### How It Works

**Development (npm run dev):**
```
React App → Vite Proxy → Backend on Render
(localhost:5174) → (/api/*) → (https://sap-technologies-ug.onrender.com)
```

**Production (npm run build):**
```
React App → Direct Connection → Backend on Render
(your-domain.com) → (https://sap-technologies-ug.onrender.com/api/*)
```

### All API Endpoints

| Category | Endpoint | Method | Component |
|----------|----------|--------|-----------|
| **Partners** | `/api/partners` | GET, POST, PUT, DELETE | Partners.jsx |
| **Products** | `/api/products` | GET, POST, PUT, DELETE | Products.jsx |
| | `/api/products/categories` | GET | Products.jsx |
| | `/api/product-inquiry` | POST | ProductInquiryForm.jsx |
| **Services** | `/api/services` | GET, POST, PUT, DELETE | Services.jsx |
| | `/api/service-quote` | POST | ServiceQuoteForm.jsx |
| **Projects** | `/api/projects` | GET, POST, PUT, DELETE | Portfolio.jsx |
| **Awards** | `/api/awards` | GET, POST, PUT, DELETE | Awards.jsx |
| **Auth** | `/api/auth/register` | POST | AuthModal.jsx |
| | `/api/auth/login` | POST | AuthModal.jsx |
| | `/api/auth/logout` | POST | Account.jsx |
| | `/api/auth/me` | GET | Account.jsx |
| | `/api/auth/forgot-password` | POST | ForgotPassword.jsx |
| | `/api/auth/reset-password` | POST | ForgotPassword.jsx |
| **Admin** | `/api/admin/users` | GET, PUT, DELETE | AdminDashboard.jsx |
| | `/api/admin/stats` | GET | AdminDashboard.jsx |
| **Contact** | `/api/contact` | POST | Contact.jsx |
| **Newsletter** | `/api/newsletter/subscribe` | POST | Newsletter.jsx |
| **Partner Requests** | `/api/partner-requests` | POST | PartnerRequestForm.jsx |
| **Certificates** | `/api/certificates/verify/:code` | GET | CertificateVerify.jsx |

### Components Using API (23 components)

✅ Partners.jsx
✅ Products.jsx
✅ Services.jsx
✅ Portfolio.jsx
✅ Awards.jsx
✅ AuthModal.jsx
✅ Account.jsx
✅ AdminDashboard.jsx
✅ Contact.jsx
✅ Newsletter.jsx
✅ PartnerForm.jsx
✅ PartnerRequestForm.jsx
✅ ProductForm.jsx
✅ ProductInquiryForm.jsx
✅ ServiceForm.jsx
✅ ServiceQuoteForm.jsx
✅ ForgotPassword.jsx
✅ CertificateVerify.jsx
✅ AwardsAdmin.jsx

### Testing Commands

```powershell
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Change API URL

**Option 1: Environment Variable (Recommended)**
```bash
# .env.production
VITE_API_URL=https://your-new-api-url.com
```

**Option 2: Update Vite Config**
```javascript
// vite.config.js
target: "https://your-new-api-url.com"
```

**Option 3: Update API Service**
```javascript
// src/services/api.js
return import.meta.env.VITE_API_URL || "https://your-new-api-url.com";
```

### Status: ✅ READY TO USE

Your API configuration is complete and all components are properly connected!

---

📚 For detailed information, see: `API_CONFIGURATION.md`
