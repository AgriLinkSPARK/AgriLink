# AgriLink — Stripe Payment Integration Guide

## Architecture Overview

```
Frontend                    Backend                         Stripe
───────────────────────────────────────────────────────────────────
1. POST /api/orders/checkout        ← creates Order (Pending / Unpaid)
2. POST /api/payment/create-payment-intent/:orderId
   ← returns { clientSecret }
3. stripe.confirmPayment(clientSecret)  ──────────────────►  charge
4.                                         Stripe webhook  ──►
                               POST /api/payment/webhook
                               order.paymentStatus = "Paid"
                               order.status        = "Confirmed"
5. GET /api/payment/status/:orderId ← poll / verify on return page
```

---

## Backend API Reference

### 1. Checkout — create an order
```
POST /api/orders/checkout
Authorization: Bearer <jwt>

Response 201:
{
  "message": "Order created. Proceed to payment.",
  "order": { "_id": "ORDER_ID", "totalPrice": 49.99, "status": "Pending", ... }
}
```

### 2. Create Payment Intent
```
POST /api/payment/create-payment-intent/:orderId
Authorization: Bearer <jwt>

Response 200:
{
  "clientSecret"    : "pi_xxx_secret_yyy",
  "paymentIntentId" : "pi_xxx",
  "amount"          : 4999,        // cents
  "currency"        : "usd"
}
```
> **Idempotent** — calling this twice for the same unpaid order returns the same `clientSecret`.

### 3. Stripe Webhook (Stripe → Backend only, no auth header)
```
POST /api/payment/webhook
Stripe-Signature: t=...,v1=...

Events handled:
  payment_intent.succeeded      → order marked Paid + Confirmed
  payment_intent.payment_failed → order marked Failed
  payment_intent.canceled       → intent cleared, order stays Unpaid (can retry)
```

### 4. Poll Payment Status
```
GET /api/payment/status/:orderId
Authorization: Bearer <jwt>

Response 200:
{
  "orderId"               : "ORDER_ID",
  "paymentStatus"         : "Paid",
  "orderStatus"           : "Confirmed",
  "stripePaymentIntentId" : "pi_xxx",
  "paidAt"                : "2026-02-25T16:45:00.000Z",
  "totalPrice"            : 49.99
}
```

---

## Frontend Integration (React + Stripe.js)

### Install dependencies
```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

### CheckoutPage.jsx (minimal example)
```jsx
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useEffect, useState } from "react";
import axios from "axios";

const stripePromise = loadStripe("pk_test_YOUR_PUBLISHABLE_KEY");

function PaymentForm({ orderId }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment-success?orderId=${orderId}`,
      },
    });

    if (error) setError(error.message);
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      {error && <p style={{ color: "red" }}>{error}</p>}
      <button type="submit" disabled={!stripe || loading}>
        {loading ? "Processing..." : "Pay Now"}
      </button>
    </form>
  );
}

export default function CheckoutPage({ orderId }) {
  const [clientSecret, setClientSecret] = useState(null);

  useEffect(() => {
    axios
      .post(`/api/payment/create-payment-intent/${orderId}`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((res) => setClientSecret(res.data.clientSecret))
      .catch((err) => console.error(err));
  }, [orderId]);

  if (!clientSecret) return <p>Loading payment...</p>;

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <PaymentForm orderId={orderId} />
    </Elements>
  );
}
```

### PaymentSuccess.jsx (return URL page)
```jsx
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";

export default function PaymentSuccess() {
  const [params] = useSearchParams();
  const orderId = params.get("orderId");
  const [status, setStatus] = useState("Loading...");

  useEffect(() => {
    if (!orderId) return;
    // Poll until webhook has updated the order (usually < 2 s)
    const poll = async () => {
      for (let i = 0; i < 10; i++) {
        const { data } = await axios.get(`/api/payment/status/${orderId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (data.paymentStatus === "Paid") {
          setStatus("Payment confirmed! Your order is now Confirmed.");
          return;
        }
        await new Promise((r) => setTimeout(r, 1500));
      }
      setStatus("Payment is processing. Check My Orders for the latest status.");
    };
    poll();
  }, [orderId]);

  return <h2>{status}</h2>;
}
```

---

## Local Webhook Testing with Stripe CLI

1. **Install Stripe CLI** → https://stripe.com/docs/stripe-cli
2. **Login:**
   ```powershell
   stripe login
   ```
3. **Forward webhooks to your local server:**
   ```powershell
   stripe listen --forward-to localhost:5000/api/payment/webhook
   ```
4. **Copy the webhook signing secret** printed by the CLI (starts with `whsec_`).
5. **Paste it into `.env`:**
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_<paste_here>
   ```
6. **Trigger a test event** (in a second terminal):
   ```powershell
   stripe trigger payment_intent.succeeded
   ```

---

## Production Checklist

| Item | Notes |
|------|-------|
| Replace `STRIPE_SECRET_KEY` with live key (`sk_live_...`) | Stripe Dashboard → Developers → API Keys |
| Create a live webhook endpoint | Dashboard → Developers → Webhooks → Add endpoint → `https://yourdomain.com/api/payment/webhook` |
| Subscribe webhook to events | `payment_intent.succeeded`, `payment_intent.payment_failed`, `payment_intent.canceled` |
| Copy live `STRIPE_WEBHOOK_SECRET` | From Dashboard webhook detail page |
| Replace frontend `pk_test_...` with `pk_live_...` | In your React app |
| Set `STRIPE_CURRENCY` | Match your business currency (e.g. `lkr`, `usd`) |
| Enable HTTPS | Required for Stripe in production |

---

## Database Fields Added to Order

| Field | Type | Purpose |
|-------|------|---------|
| `stripePaymentIntentId` | String (indexed) | Links order → Stripe intent; used for webhook lookup |
| `stripeClientSecret` | String | Returned to frontend for `confirmPayment()` |
| `stripePaymentDetails` | Mixed | Snapshot of Stripe intent after payment confirmed |
| `paidAt` | Date | Timestamp of confirmed payment |
