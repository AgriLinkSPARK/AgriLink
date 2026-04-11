# Deployment Quick Reference

**TL;DR** — Deploy AgriLink in 3 steps.

---

## 📋 Pre-Deployment (Do This First)

1. **Run the deployment checklist**
   - Open: [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)
   - Complete all ✅ boxes
   - This takes 10-15 minutes and catches 90% of issues

2. **Push latest code to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

---

## 🚀 Deploy in 3 Steps

### Step 1: Deploy Backend (15 min)
- Open: [RENDER_VERCEL_DEPLOYMENT.md](RENDER_VERCEL_DEPLOYMENT.md) → **Part 1**
- Platform: Render (recommended) or Railway
- Result: Get your backend URL (e.g., `https://agrilink-backend-xxxxx.onrender.com`)

### Step 2: Deploy Frontend (15 min)
- Open: [RENDER_VERCEL_DEPLOYMENT.md](RENDER_VERCEL_DEPLOYMENT.md) → **Part 2**
- Platform: Vercel (recommended) or Netlify
- Use backend URL from Step 1 when setting `REACT_APP_API_BASE_URL`
- Result: Get your frontend URL (e.g., `https://agrilink.vercel.app`)

### Step 3: Connect & Verify (10 min)
- Open: [RENDER_VERCEL_DEPLOYMENT.md](RENDER_VERCEL_DEPLOYMENT.md) → **Parts 3-6**
- Update backend `CLIENT_URL` with frontend URL from Step 2
- Test backend: Open `https://your-backend-domain/`
- Test frontend: Open `https://your-frontend-domain/` and log in
- Test API: Open DevTools → Network → confirm calls go to your backend

---

## 🔑 Environment Variables You'll Need

### Backend (copy from your local `.env` file)

```
NODE_ENV=production
PORT=5000
MONGO_URI=
JWT_SECRET=
JWT_EXPIRE=7d
CLIENT_URL=<paste-your-vercel-frontend-url>
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_CURRENCY=usd
... (optional: Cloudinary, Brevo, Twilio keys)
```

**Source**: See [backend/.env.example](backend/.env.example) for all available options.

### Frontend (2 variables only)

```
REACT_APP_API_BASE_URL=<your-render-backend-url>/api
REACT_APP_STRIPE_PUBLIC_KEY=
```

**Source**: See [frontend/.env.example](frontend/.env.example)

---

## 📊 Platform Matrix

Choose what works for you:

| Backend | Frontend | Cost | Docs |
|---------|----------|------|------|
| Render | Vercel | Both free | [Step-by-step →](RENDER_VERCEL_DEPLOYMENT.md) |
| Railway | Netlify | Both free | See DEPLOYMENT.md Section 7 |
| Heroku | Netlify | Heroku paid | Similar to Render |
| AWS | AWS | Pay as you go | Similar to Render |

---

## 🔍 Verify Checklist (After Deployment)

- [ ] Backend URL in browser shows "API running..."
- [ ] Backend URL + `/api-docs` shows Swagger
- [ ] Frontend loads without console errors (F12)
- [ ] Login works and stores JWT token
- [ ] API Network requests point to your backend domain (not localhost)
- [ ] Deep route refresh works (no 404)
- [ ] Payment flow works (if using Stripe)
- [ ] Stripe webhook logs show events

**If all pass → You're ready for users!**

---

## ⚠️ Common Gotchas

| Problem | Fix |
|---------|-----|
| CORS blocked | Check `CLIENT_URL` matches frontend exactly (case-sensitive, no slash) |
| Frontend calls localhost:5000 | Set `REACT_APP_API_BASE_URL` on frontend platform and redeploy |
| 404 on page refresh | Ensure `vercel.json` is in frontend root |
| Logs show "Cannot connect to MongoDB" | Verify `MONGO_URI` and whitelist deployment IP in MongoDB Atlas |
| Stripe webhook failing | Verify endpoint URL is correct and webhook secret matches live key |

---

## 📞 Quick Links

- **Render**: https://dashboard.render.com
- **Vercel**: https://vercel.com/dashboard
- **MongoDB Atlas**: https://cloud.mongodb.com
- **Stripe Dashboard**: https://dashboard.stripe.com

---

## 📚 Full Documentation

- Step-by-step with screenshots: [RENDER_VERCEL_DEPLOYMENT.md](RENDER_VERCEL_DEPLOYMENT.md)
- Render + Railway alternatives: [DEPLOYMENT.md](DEPLOYMENT.md) Section 7
- Pre-deployment checklist: [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)

---

**Questions?** Check the relevant doc above or troubleshoot section in [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md).
