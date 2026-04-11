# Deployment Readiness Checklist

Use this checklist to ensure your AgriLink project is ready for production deployment.

---

## ✅ Code Quality & Security

- [ ] **No `.env` files committed**: Verify `.env` and `.env.*` are in `.gitignore` (already configured)
  ```bash
  git log --all --full-history -- "backend/.env" "frontend/.env"
  # Should return: no results
  ```

- [ ] **No hardcoded secrets in code**: Search for hardcoded keys:
  ```bash
  grep -r "sk_test_\|sk_live_\|pk_test_\|pk_live_" --include="*.js" --include="*.jsx" backend/ frontend/
  # Should return: only in comments or .env.example files
  ```

- [ ] **No console.logs for sensitive data**: Backend logging is appropriate for development/errors

- [ ] **package-lock.json committed**: Required for reproducible builds
  ```bash
  git ls-files | grep package-lock.json
  # Should show: backend/package-lock.json and frontend/package-lock.json
  ```

---

## ✅ Environment Configuration

### Backend

- [ ] **`NODE_ENV` set to `production`** in deployment platform
  - Render/Railway: Add env var `NODE_ENV=production`
  - Verifies: Swagger docs use `/api` relative path
  - Verifies: Error handling is production-ready

- [ ] **`MONGO_URI` configured** (MongoDB Atlas connection string)
  - Format: `mongodb+srv://<user>:<password>@<cluster>/<database>?retryWrites=true&w=majority`
  - Endpoint: Choose `+srv` suffix for managed/cloud MongoDB

- [ ] **`JWT_SECRET` is a long random string** (minimum 32 characters)
  ```bash
  # Generate one:
  openssl rand -base64 32
  ```

- [ ] **`STRIPE_SECRET_KEY` uses live key** (starts with `sk_live_` not `sk_test_`)
  - Test: Keep test key through all dev/staging
  - Production: Must switch to live key and test immediately

- [ ] **`STRIPE_WEBHOOK_SECRET` is live webhook secret** when using live Stripe
  - Obtain from: Stripe Dashboard → Developers → Webhooks
  - Test: Verify webhook endpoint is receiving events

- [ ] **`CLIENT_URL` matches deployed frontend exactly**
  - Example: `https://agrilink.vercel.app` (no trailing slash)
  - Critical: Enables CORS, frontend login redirects, Stripe returns

- [ ] **`CLIENT_URLS` (optional) includes preview domains**
  - Example: `https://preview-main.vercel.app,https://preview-dev.vercel.app`
  - Allows: Testing preview branches without main deployment

- [ ] **Cloudinary credentials set** (if image upload is used)
  - `CLOUD_NAME`, `CLOUD_API_KEY`, `CLOUD_API_SECRET`
  - Obtain from: Cloudinary dashboard

- [ ] **Email service configured** (Brevo)
  - `BREVO_API_KEY` is valid
  - `EMAIL_FROM` is authorized sender address on Brevo
  - Test: Send welcome email to yourself

### Frontend

- [ ] **`REACT_APP_API_BASE_URL` points to deployed backend**
  - Example: `https://agrilink-backend-xxxxx.onrender.com/api`
  - Verify: Ends with `/api`
  - Test: Open browser DevTools → Network → confirm API calls go to correct domain

- [ ] **`REACT_APP_STRIPE_PUBLIC_KEY` is live key** (starts with `pk_live_`)
  - Test: Matches the live `STRIPE_SECRET_KEY` account
  - Verify: Stripe test mode is disabled before going live

---

## ✅ Build & Deployment Files

- [ ] **`backend/.env.example`** exists and is up-to-date
  - Contains: All required and optional env vars with placeholder values
  - Purpose: Template for deployment platform setup

- [ ] **`frontend/.env.example`** exists and is up-to-date
  - Contains: `REACT_APP_API_BASE_URL`, `REACT_APP_STRIPE_PUBLIC_KEY`

- [ ] **`render.yaml`** configured for one-click Render deployment
  - Includes: All backend env vars defined
  - Location: Root of repository

- [ ] **`frontend/vercel.json`** exists for SPA routing fallback
  - Ensures: Deep route refreshes don't return 404
  - Location: At root of frontend folder

- [ ] **`frontend/public/_redirects`** exists for Netlify/Firebase fallback
  - Fallback option if Netlify is used instead of Vercel
  - Location: frontend/public folder

- [ ] **`DEPLOYMENT.md`** and `RENDER_VERCEL_DEPLOYMENT.md`** exist
  - Provides: Step-by-step deployment instructions for team

---

## ✅ Backend Configuration

- [ ] **`backend/server.js`** properly uses environment variables
  - Verified: PORT defaults to `process.env.PORT` (Render assigns this)
  - Verified: CORS uses `CLIENT_URL` and `CLIENT_URLS`
  - Verified: MongoDB connection uses `MONGO_URI`

- [ ] **Swagger docs work in production**
  - Check: Deployed backend URL + `/api-docs` loads Swagger UI
  - Verify: "Try it out" buttons work against production API

- [ ] **Stripe webhook endpoint is registered**
  - In: Stripe Dashboard → Developers → Webhooks
  - URL: `https://your-backend-domain/api/payment/webhook`
  - Events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `payment_intent.canceled`

---

## ✅ Frontend Configuration

- [ ] **`frontend/src/services/api.js`** uses `REACT_APP_API_BASE_URL`
  - Verified: Default fallback to `http://localhost:5000/api` for local dev only

- [ ] **No hardcoded frontend domain references**
  - Search: Remove hardcoded `localhost:3000`, `localhost:5173` from UI
  - Kept in: Allowed in CORS config in backend (for local dev)

- [ ] **`package.json` build script is correct**
  - Script: `npm run build`
  - Output directory: `build`
  - For Render: If frontend is served from same dyno, ensure build script works

---

## ✅ Database

- [ ] **MongoDB Atlas cluster created**
  - URL: `mongodb+srv://...` with authentication
  - Network access: Whitelist deployment platform IPs or use 0.0.0.0/0
  - Backup: Enable automated backups if on paid tier

- [ ] **Database user created** (not the account owner)
  - Permissions: Read and write only on production database
  - Credentials: Stored securely in deployment platform

---

## ✅ Git & Version Control

- [ ] **Latest changes pushed to GitHub**
  ```bash
  git status  # Should show: nothing to commit
  git log --oneline | head -3  # Shows recent commits
  ```

- [ ] **No sensitive files in git history**
  ```bash
  git log --all --oneline --name-only | grep -E "\.env|secrets" | sort -u
  # Should return: nothing or only .env.example
  ```

- [ ] **Main/default branch is clean**
  - All PRs merged
  - No experimental code on main

---

## ✅ Performance & Monitoring

- [ ] **Production API logs are enabled**
  - Backend: Logs visible in Render/Railway dashboard
  - Monitoring: Set up alerts for errors (optional)

- [ ] **Frontend build is optimized**
  - Verify: `npm run build` completes without warnings
  - Size: Check `frontend/build/` is < 5MB (typical for CRA)

---

## ✅ Testing Before Going Live

### Manual Testing

1. **Backend health check**
   ```
   Open: https://your-backend-domain/
   Expected: "AgriLink API is running..."
   ```

2. **API documentation**
   ```
   Open: https://your-backend-domain/api-docs
   Expected: Swagger UI loads with all endpoints listed
   ```

3. **Frontend home page**
   ```
   Open: https://your-frontend-domain/
   Expected: App loads, no console errors (F12)
   ```

4. **Login flow**
   ```
   Attempt: Register as customer
   Expected: Succeeds, JWT token stored in localStorage
   Verify: No CORS errors in Network tab
   ```

5. **API integration**
   ```
   Action: View products on homepage
   Expected: API call to backend completes successfully
   Verify: Network tab shows request to correct domain
   ```

6. **Deep route persistence**
   ```
   Action: Navigate to /farmer/products, then refresh page
   Expected: App still loads, route preserved
   Issue: Would indicate Vercel/Netlify SPA fallback not working
   ```

7. **Payment functionality** (if enabled)
   ```
   Action: Create order and attempt payment
   Expected: Redirects to Stripe, test card accepted
   Verify: Stripe webhook logs show events in dashboard
   ```

---

## ✅ Critical Before Production Go-Live

- [ ] **Enable HTTPS everywhere**
  - Both domains must use HTTPS (not HTTP)
  - Automatic: Render, Vercel, Railway all provide free SSL

- [ ] **Update Stripe to live mode**
  - **WARNING**: This must be done carefully
  - Step 1: Keep test keys throughout initial deployment
  - Step 2: After 24-48 hours of testing, obtain live keys from Stripe
  - Step 3: Update `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` on backend
  - Step 4: Update `REACT_APP_STRIPE_PUBLIC_KEY` on frontend
  - Step 5: Verify webhook is live (Stripe dashboard shows live endpoint)
  - Step 6: Test payment with real card using small amount ($0.01)

- [ ] **Rotate JWT_SECRET** (if it was ever used in dev/test)
  - Generate new secret: `openssl rand -base64 32`
  - Update on backend
  - Impact: All existing tokens will be invalidated (users must re-login)

- [ ] **Backup MongoDB before going live**
  - Atlas: Automated backups are enabled by default on paid tiers
  - Free tier: Manual backup recommended

- [ ] **Set up error alerts** (optional but recommended)
  - Render: Create uptime monitor
  - Datadog/Sentry: Optional error tracking for production

---

## ✅ Deployment Platform Quick Links

**Render**
- Dashboard: https://dashboard.render.com
- Services: View logs, redeploy, update env vars
- Domains: Custom domain setup under Service Settings

**Vercel**
- Dashboard: https://vercel.com/dashboard
- Analytics: Check deployment status and build logs
- Domains: Configure custom domains under Project Settings

**Stripe**
- Test Dashboard: https://dashboard.stripe.com (in test mode by default)
- Switch to Live: Account Settings → enable live keys
- Webhooks: Developers → Webhooks → view received events

**MongoDB Atlas**
- Dashboard: https://cloud.mongodb.com
- Cluster: View connection status, whitelist IPs, backups

---

## 🚀 Deployment Order

1. **Prepare**: Complete all ✅ checkboxes above
2. **Deploy Backend**: Follow [RENDER_VERCEL_DEPLOYMENT.md](RENDER_VERCEL_DEPLOYMENT.md) Part 1
3. **Deploy Frontend**: Follow [RENDER_VERCEL_DEPLOYMENT.md](RENDER_VERCEL_DEPLOYMENT.md) Part 2
4. **Connect**: Follow [RENDER_VERCEL_DEPLOYMENT.md](RENDER_VERCEL_DEPLOYMENT.md) Part 3
5. **Configure Webhook**: Follow [RENDER_VERCEL_DEPLOYMENT.md](RENDER_VERCEL_DEPLOYMENT.md) Part 4
6. **Verify**: Follow [RENDER_VERCEL_DEPLOYMENT.md](RENDER_VERCEL_DEPLOYMENT.md) Part 5
7. **Test Thoroughly**: Complete all manual tests above
8. **Go Live**: Only switch secrets to production after 24-48h testing with test keys

---

## 🆘 Troubleshooting

| Symptom | Check |
|---------|-------|
| CORS blocked in browser console | Verify `CLIENT_URL` in backend env matches frontend domain exactly |
| Frontend shows "Cannot GET /" on refresh | Verify `vercel.json` exists in frontend root |
| Payment webhook not triggering | Verify webhook endpoint URL in Stripe and redeploy backend |
| API calls return 502 Bad Gateway | Check Render/Railway logs for server startup errors |
| Build fails on Vercel | Verify `package-lock.json` is committed; run `npm install` locally |
| MongoDB connection timeout | Verify `MONGO_URI` is correct and cluster whitelist includes deployment IP |

---

## ✨ Success Criteria

All of the following should be true:

- ✅ `https://your-backend.domain/` returns API running message
- ✅ `https://your-frontend.domain/` loads React app without console errors
- ✅ Login works and returns JWT token
- ✅ API requests show in Network tab going to correct backend domain
- ✅ Deep route refresh on frontend works (no 404)
- ✅ Payment flow (if enabled) redirects to Stripe successfully
- ✅ Stripe webhook is marked "Verified" in Stripe dashboard
- ✅ All environment variables are `Reveal Value` safe (no test keys visible on live)
- ✅ `.env` files are not visible in GitHub repo
- ✅ Zero console errors in browser F12 DevTools

**When all ✅ are complete, your app is production-ready.**
