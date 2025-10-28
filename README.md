# link-leap

MERN-style URL shortener scaffold (Vite + React frontend in `frontend/`, backend API routes in `backend/api/`, MongoDB via Mongoose). Ready for deployment to Vercel.

## What I added
- `backend/api/shorten.js` — POST to create short links
- `backend/api/[shortCode].js` — GET redirect and increment clicks
- `backend/api/links.js` — GET all links for dashboard
- `backend/models/Url.js` — Mongoose model
- `backend/lib/dbConnect.js` — MongoDB connection helper
- `frontend/src/pages/Home.jsx` — URL shortener UI
- `frontend/src/pages/Dashboard.jsx` — list links table
- `frontend/src/components/Navbar.jsx`, `UrlCard.jsx`
- `vercel.json` — build & routes for Vercel (serves `frontend` and `backend/api`)

## Environment variables (set in Vercel or locally)
- `MONGO_URI` — MongoDB Atlas connection string
- `BASE_URL` — Your deployed app URL (e.g. `https://yourapp.vercel.app`)
 - `BASE_URL` — Your deployed app URL (e.g. `https://yourapp.vercel.app`)

Custom alias
- The API supports an optional `customAlias` when creating a short link. It must match the pattern `^[A-Za-z0-9_-]{3,64}$` and must be unique. You can pass it from the frontend's Home form.

## Local dev
Install dependencies for the whole repo and run both frontend and backend together from the repository root:

```cmd
cd c:\Users\sivas\Desktop\Projects\link-leap
npm install
cd frontend
npm install
cd ..\backend
npm install
cd ..
npm run dev
```

This uses the root `dev` script which runs both the Vite frontend and the backend Express server concurrently.

Alternatively you can run them separately in two terminals:

Terminal A (frontend):
```cmd
cd frontend
npm run dev
```

Terminal B (backend):
```cmd
cd backend
npm run dev
```

## Deploying
1. Push this repo to GitHub.
2. Create a project on Vercel and connect the repository.
3. Add environment variables in Vercel dashboard: `MONGO_URI`, `BASE_URL`.
4. Vercel will build the frontend and deploy serverless functions found in `backend/api`.

## Notes & next steps
- You may want to add validation, rate-limiting, auth, and tests.
- Consider adding nicer UI, Tailwind, and copy-to-clipboard UI improvements.
