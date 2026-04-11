# Render + Vercel Deployment: Exact Dashboard Steps

Follow this guide step-by-step to deploy backend on Render and frontend on Vercel.

---

## Part 1: Backend Deployment on Render

### Step 1: Create Render Account
1. Go to https://render.com
2. Click **Sign Up**
3. Choose **Sign up with GitHub** (recommended for auto-deploys)
4. Authorize Render to access your GitHub account
5. Complete signup

### Step 2: Create Backend Service

1. In Render Dashboard, click **New +** (top right)
2. Select **Web Service**
3. Under **Connect a repository**, click **Connect GitHub account** if not already done
4. Search for and select: **AgriLink** (or your fork name)
5. Click **Connect**

### Step 3: Configure Web Service

You'll see a form. Fill it as follows:

| Field | Value |
|-------|-------|
| Name | `agrilink-backend` |
| Environment | `Node` |
| Region | Keep default or choose closest to users |
| Branch | `main` (or your default) |
| Root Directory | `backend` |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Plan | `Free` (or upgrade if needed) |

Click **Create Web Service**

### Step 4: Add Environment Variables to Render

After service is created, you'll see the service dashboard.

1. Click **Environment** tab (left sidebar)
2. Click **Add Environment Variable** (or paste as raw)
3. Add each variable from below. Copy from [backend/.env.example](../backend/.env.example):

**CRITICAL (must have):**

```
NODE_ENV=production
MONGO_URI=mongodb+srv://<your-username>:<your-password>@<your-cluster>/<database>?retryWrites=true&w=majority
JWT_SECRET=<generate-a-long-random-string>
JWT_EXPIRE=7d
STRIPE_SECRET_KEY=sk_test_51T4kRyDVJwBRn9YQcUXk5WwuzxsITcFzka9MdqRcMf0atqMtZQITSDo5gART0Wf30C9m9iQ8du2nO25BtnSOy2ZU00fT5oxAB5
STRIPE_WEBHOOK_SECRET=whsec_69914d25c4889b3595d0ffa94066f5bf9c44f49c1798712adc7029f4b6ca0672
STRIPE_CURRENCY=usd
CLIENT_URL=https://your-vercel-frontend-url.vercel.app
```

**OPTIONAL (add these only if you use them):**

```
CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_API_SECRET=your_cloudinary_api_secret
BREVO_API_KEY=your_brevo_api_key
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=AgriLink
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
TWILIO_WHATSAPP_CONTENT_SID=HXxxxxxxxxxxxxxxx
TWILIO_WHATSAPP_CONTENT_VARIABLES={"1":"12/1","2":"3pm"}
TWILIO_WHATSAPP_TEST_TO=+1234567890
DIALOG_API_TOKEN=your_dialog_token
DIALOG_SMS_API_URL=https://your-dialog-endpoint
DIALOG_SOURCE_ADDRESS=AgriLink
```

**How to add variables:**

For each variable:
1. Click **Add Environment Variable**
2. Paste key (example: `NODE_ENV`)
3. Paste value (example: `production`)
4. Press Enter or click checkmark
5. Repeat for all variables

**OR paste all at once using raw format:**
1. Click **Add Environment Variable**
2. In the dropdown, select **Raw** (if available)
3. Paste all variables in `KEY=VALUE` format separated by newlines
4. Click Save

### Step 5: Deploy Backend

1. Scroll to top and click **Manual Deploy** or **Create Deploy**
2. Wait for logs to show: `🔴 Server running on port 5000` (or similar)
3. Copy the **Render public URL** at the top, example:
   ```
   https://agrilink-backend-xxxxx.onrender.com
   ```
4. Test it by opening that URL in browser—you should see "AgriLink API is running..."

**Keep this URL handy—you'll need it for Vercel.**

---

## Part 2: Frontend Deployment on Vercel

### Step 1: Create Vercel Account

1. Go to https://vercel.com
2. Click **Sign Up**
3. Click **Continue with GitHub**
4. Authorize Vercel
5. Complete signup

### Step 2: Create Frontend Project

1. In Vercel Dashboard, click **Add New...** (top left)
2. Select **Project**
3. Click **Import Git Repository**
4. Search for and select: **AgriLink** (your repo)
5. Click **Import**

### Step 3: Configure Project

You'll see a form. Fill it as follows:

| Field | Value |
|-------|-------|
| Project Name | `agrilink-frontend` |
| Framework Preset | `Create React App` |
| Root Directory | `frontend` |
| Build Command | `npm run build` |
| Output Directory | `build` |

Leave other settings as default.

### Step 4: Add Frontend Environment Variables

Before clicking Deploy, scroll down to **Environment Variables**.

Add these variables. Copy values from [frontend/.env.example](../frontend/.env.example):

```
REACT_APP_API_BASE_URL=https://agrilink-backend-xxxxx.onrender.com/api
REACT_APP_STRIPE_PUBLIC_KEY=pk_test_51T4kRyDVJwBRn9YQtaCzUijvRLkHDXPDE1fSM1EEl4E6c7zjCmC0AmqXwYa3UbDJTq2muu6YeKj2fCa01fUuiiv600rUT6KVgH
```

**How to add:**

For each variable:
1. Under **Environment Variables**, click **Add New**
2. Enter key (example: `REACT_APP_API_BASE_URL`)
3. Enter value (your Render backend URL + `/api`)
4. Click **Add**
5. Repeat

### Step 5: Deploy Frontend

1. Scroll down and click **Deploy**
2. Wait for build to complete (usually 2-3 minutes)
3. When done, you'll see a success message with a URL:
   ```
   https://agrilink-frontend-xxxxx.vercel.app
   ```

**Keep this URL—you need it next.**

---

## Part 3: Connect Frontend URL Back to Render

Now that Vercel is deployed, you need to tell Render about your frontend domain so CORS works.

1. Go back to Render Dashboard
2. Open your **agrilink-backend** service
3. Click **Environment** tab
4. Find the `CLIENT_URL` variable
5. Click the **edit icon** (pencil)
6. Replace the value with your Vercel URL:
   ```
   https://agrilink-frontend-xxxxx.vercel.app
   ```
7. Press Enter or click **Save Changes**
8. Render will auto-redeploy your backend (watch the logs)
9. Wait until you see `🔴 Server running on port 5000`

---

## Part 4: Configure Stripe Webhook (If Using Payments)

### 4a: Create Webhook Endpoint in Stripe Dashboard

1. Go to https://dashboard.stripe.com
2. Login with your test account
3. Go to **Developers** → **Webhooks** (left sidebar)
4. Click **Add Endpoint**
5. Endpoint URL: paste your Render backend URL + `/api/payment/webhook`
   ```
   https://agrilink-backend-xxxxx.onrender.com/api/payment/webhook
   ```
6. Select events to send:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`
7. Click **Add Endpoint**

### 4b: Copy Webhook Secret to Render

1. You'll see your new webhook listed
2. Click on it
3. Scroll down and copy the **Signing secret** (starts with `whsec_`)
4. Go back to Render Dashboard
5. Open **agrilink-backend** service
6. Click **Environment** tab
7. Find `STRIPE_WEBHOOK_SECRET` and edit it
8. Paste the webhook secret
9. Click **Save Changes**
10. Wait for auto-redeploy

---

## Part 5: Verify Everything Works

### Test Backend

1. Open your Render backend URL in browser:
   ```
   https://agrilink-backend-xxxxx.onrender.com/
   ```
   Should show: **"AgriLink API is running..."**

2. Check API docs:
   ```
   https://agrilink-backend-xxxxx.onrender.com/api-docs
   ```
   Should show Swagger UI with all endpoints

### Test Frontend

1. Open your Vercel frontend URL:
   ```
   https://agrilink-frontend-xxxxx.vercel.app
   ```
2. Try logging in as a customer or farmer
3. Open browser **Developer Tools** (F12)
4. Check **Console** tab—should see no red errors
5. Check **Network** tab—API calls should go to your Render backend (not localhost)

### Test Deep Routes

1. On frontend, navigate to a page (example: `/farmer/products/new`)
2. **Refresh the page** (Cmd+R or Ctrl+R)
3. App should still load, not show 404
   - (This confirms SPA fallback in `vercel.json` is working)

### Test Payment Flow (If Enabled)

1. Create an order as customer
2. Try payment—should redirect to Stripe test page
3. Use test card: `4242 4242 4242 4242` with any future expiry
4. Complete payment
5. Check in Stripe Dashboard → **Webhooks** → click your endpoint
6. Should see **"sent"** events logged (confirms webhook is receiving)

---

## Part 6: Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| **CORS blocked error in console** | Verify `CLIENT_URL` in Render matches your Vercel URL exactly (include https://) |
| **Frontend calls localhost:5000** | Check `REACT_APP_API_BASE_URL` is set correctly on Vercel and redeploy |
| **Webhook returning 401/403** | Verify `STRIPE_WEBHOOK_SECRET` is correct and redeploy Render |
| **Deep route returns 404 on refresh** | Confirm `vercel.json` exists at root of frontend folder |
| **Build fails on Vercel** | Check `package.json` has all dependencies listed; run `npm install` locally and commit `package-lock.json` |
| **Render service crashes on startup** | Check logs: Service Logs tab → look for errors; usually missing env vars |

---

## Summary of URLs to Save

After deployment, save these:

```
Backend API: https://agrilink-backend-xxxxx.onrender.com
Backend Docs: https://agrilink-backend-xxxxx.onrender.com/api-docs
Frontend: https://agrilink-frontend-xxxxx.vercel.app
```

---

## Next Steps

- Set up a custom domain for frontend (in Vercel Settings → Domains)
- Set up a custom domain for backend if needed (in Render Settings → Custom Domain)
- Generate live Stripe keys and update both platforms when ready for production
- Monitor logs regularly in both dashboards to catch issues early
