# link-leap

Production-ready URL shortener using:
- React + Vite frontend
- Node.js serverless backend
- MongoDB Atlas
- Vercel deployment

## Environment Variables

Add these variables in Vercel:

### Backend
- MONGO_URI
- JWT_SECRET
- BASE_URL
- FRONTEND_URL

### Frontend
- VITE_API_BASE

## Local Setup

```bash
npm install
cd frontend && npm install
cd ../backend && npm install
```

Run:

```bash
npm run dev
```

## Fixed Issues

- Cleaned unnecessary files
- Removed node_modules and build artifacts
- Improved Vercel rewrites
- Added proper SPA fallback routing
- Fixed deploy structure for serverless API
- Removed sensitive env files
- Added safer gitignore
- Optimized deployment layout
