import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

// Ensure this uses your actual Stripe test publishable key (begins with pk_test_...)
const STRIPE_PUBLISHABLE_KEY = process.env.REACT_APP_STRIPE_PUBLIC_KEY || "pk_test_51T4kRyDVJwBRn9YQtaCzUijvRLkHDXPDE1fSM1EEl4E6c7zjCmC0AmqXwYa3UbDJTq2muu6YeKj2fCa01fUuiiv600rUT6KVgH";
const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

function CheckoutForm({ order, actions, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    // Using `if_required` allows us to handle the payment on this exact single page app
    // without doing a full HTML page reload (unless the bank forces 3D secure auth).
    const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (stripeError) {
      setError(stripeError.message);
      setLoading(false);
      return;
    }

    if (paymentIntent && paymentIntent.status === "succeeded") {
      // Payment fully processed by Stripe. Trigger our state refresh manually.
      await actions.pay(order._id);
      onSuccess();
    } else {
      setLoading(false);
    }
  };

  return (
    <form className="mt-3 w-full rounded-xl border border-slate-200 bg-white p-4 shadow-sm" onSubmit={handleSubmit}>
      <h4 className="mb-4 font-bold text-slate-800">Secure Checkout</h4>
      <div className="mb-4 rounded-lg bg-slate-50 p-2 border border-slate-100">
        <PaymentElement />
      </div>
      {error && <p className="mb-3 text-sm font-semibold text-red-600">{error}</p>}
      <button
        className="w-full rounded-lg bg-earth-600 px-4 py-2.5 font-bold text-white transition hover:bg-earth-700 disabled:opacity-50"
        type="submit"
        disabled={!stripe || loading}
      >
        {loading ? "Processing..." : `Pay LKR ${order.totalPrice || "Total"}`}
      </button>
    </form>
  );
}

function BuyerPayment({ order, actions }) {
  const [clientSecret, setClientSecret] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [loadingSecret, setLoadingSecret] = useState(false);
  const [error, setError] = useState(null);

  if (order.paymentStatus === "Paid") {
    return null;
  }

  const handleStartPayment = async () => {
    setShowPayment(true);
    setLoadingSecret(true);
    setError(null);
    try {
      const secret = await actions.createPaymentIntent(order._id);
      if (secret && (typeof secret === "string" || secret.clientSecret)) {
        setClientSecret(typeof secret === "string" ? secret : secret.clientSecret);
      } else {
        throw new Error("No payment session was returned by the gateway.");
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoadingSecret(false);
    }
  };

  if (!showPayment) {
    return (
      <button
        className="rounded-md border border-earth-300 bg-white px-3 py-1.5 text-sm font-semibold text-earth-700 transition hover:bg-earth-100"
        type="button"
        onClick={handleStartPayment}
      >
        Pay Securely
      </button>
    );
  }

  if (loadingSecret) {
    return <div className="px-3 py-1.5 text-sm font-semibold text-slate-600">Initializing secure gateway...</div>;
  }

  if (!clientSecret) {
    return (
      <div className="flex flex-col gap-2">
        <p className="px-3 py-1.5 text-sm font-semibold text-red-600">{error || "Failed to load payment form."}</p>
        <button className="text-left text-sm text-slate-500" onClick={() => setShowPayment(false)}>Go back</button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md pt-2">
      <button
        className="mb-2 text-sm font-medium text-slate-500 hover:text-slate-800"
        onClick={() => setShowPayment(false)}
      >
        ← Cancel Payment
      </button>
      <Elements stripe={stripePromise} options={{ clientSecret }}>
        <CheckoutForm order={order} actions={actions} onSuccess={() => setShowPayment(false)} />
      </Elements>
    </div>
  );
}

export default BuyerPayment;
