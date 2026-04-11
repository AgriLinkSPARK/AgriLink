# AgriLink Deployment Guide

This guide deploys:
- Backend (Express API) on Render
- Frontend (React app) on Vercel

It also includes Railway + Netlify alternatives.

## 1. Prerequisites

- Push your latest code to GitHub.
- Prepare production secrets (MongoDB URI, JWT secret, Stripe keys, Cloudinary, etc.).
- Do not reuse development/test secrets in production.

## 2. Backend Deployment (Render)

### Option A: One-click with Blueprint

1. In Render, choose New + and select Blueprint.
2. Connect this repository.
3. Render will read `render.yaml` from the repo root.
4. Fill all `sync: false` env vars from `backend/.env.example`.
5. Deploy.

### Option B: Manual Web Service

1. In Render, click New + > Web Service.
2. Connect repository.
3. Configure:
   - Root Directory: `backend`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
4. Add environment variables from `backend/.env.example`.
5. Deploy.

### Required backend env vars

Minimum required for core API startup:
- `NODE_ENV=production`
- `PORT=5000` (Render may override this automatically)
- `MONGO_URI`
- `JWT_SECRET`
- `JWT_EXPIRE=7d`
- `CLIENT_URL` (your deployed frontend URL)
- `STRIPE_SECRET_KEY` (if payment endpoints are used)
- `STRIPE_WEBHOOK_SECRET` (if Stripe webhook is used)

Optional for extra features:
- Cloudinary (`CLOUD_NAME`, `CLOUD_API_KEY`, `CLOUD_API_SECRET`)
- Brevo (`BREVO_API_KEY`, `EMAIL_FROM`, `EMAIL_FROM_NAME`)
- Twilio/WhatsApp and Dialog SMS vars

### CORS notes

Backend currently supports:
- `CLIENT_URL` for primary frontend domain
- `CLIENT_URLS` as comma-separated extra domains (preview URLs, secondary domains)

Example:

```
CLIENT_URL=https://agrilink.vercel.app
CLIENT_URLS=https://agrilink-git-main-yourteam.vercel.app,https://agrilink-preview.vercel.app
```

## 3. Frontend Deployment (Vercel)

1. In Vercel, click Add New > Project.
2. Import this repository.
3. Set project root to `frontend`.
4. Configure build:
   - Framework Preset: Create React App (or Other)
   - Build Command: `npm run build`
   - Output Directory: `build`
5. Add frontend env vars from `frontend/.env.example`:
   - `REACT_APP_API_BASE_URL=https://<your-backend-domain>/api`
   - `REACT_APP_STRIPE_PUBLIC_KEY=pk_live_or_pk_test_key`
6. Deploy.

`frontend/vercel.json` is already added for SPA rewrite support.

## 4. Connect Frontend and Backend

After frontend deploy is complete:

1. Copy the frontend production URL.
2. Update backend env var `CLIENT_URL` to that URL.
3. If using preview domains, also set `CLIENT_URLS`.
4. Redeploy backend service.

## 5. Stripe Webhook (Production)

1. In Stripe Dashboard, create webhook endpoint:
   - `https://<your-backend-domain>/api/payment/webhook`
2. Subscribe at least to:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`
3. Copy webhook signing secret and set `STRIPE_WEBHOOK_SECRET` in backend.
4. Redeploy backend.

## 6. Verify Deployment

### Backend checks

- Open `https://<your-backend-domain>/` -> should return API running message.
- Open `https://<your-backend-domain>/api-docs` -> Swagger should load.

### Frontend checks

- Open frontend URL and log in.
- Confirm API requests succeed (no CORS errors).
- Refresh deep links (example: `/farmer/products/new`) and confirm app still loads.

## 7. Railway + Netlify Alternative

### Railway (Backend)

- Root: `backend`
- Build: `npm install`
- Start: `npm start`
- Set same backend env vars as Render.

### Netlify (Frontend)

- Base directory: `frontend`
- Build command: `npm run build`
- Publish directory: `build`
- Add same frontend env vars.
- SPA fallback already included at `frontend/public/_redirects`.

## 8. Security Checklist

- Rotate any secrets that were ever committed to git history.
- Use live Stripe keys only in production.
- Keep `.env` files out of version control.
- Use strong random `JWT_SECRET` values.
