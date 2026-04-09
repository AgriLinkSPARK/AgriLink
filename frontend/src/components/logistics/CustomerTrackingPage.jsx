import { useState } from "react";

const STATUS_STEPS = [
  { key: "Scheduled", label: "Scheduled", icon: "📅", description: "Order received" },
  { key: "Picked Up", label: "Picked Up", icon: "📦", description: "Picked up" },
  { key: "In Transit", label: "In Transit", icon: "🚛", description: "On the way" },
  { key: "Out for Delivery", label: "Out for Delivery", icon: "🚚", description: "Arriving today" },
  { key: "Delivered", label: "Delivered", icon: "✅", description: "Delivered" },
];

const STATUS_COLORS = {
  "Scheduled": "bg-amber-500",
  "Picked Up": "bg-blue-500",
  "In Transit": "bg-purple-500",
  "Out for Delivery": "bg-orange-500",
  "Delivered": "bg-emerald-500",
  "Cancelled": "bg-red-500",
};

function CustomerTrackingPage({ onTrackOrder }) {
  const [orderId, setOrderId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!orderId.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const data = await onTrackOrder(orderId.trim());
      if (data) {
        setResult(data);
      } else {
        setError("Order not found. Please check your Order ID and try again.");
      }
    } catch (err) {
      setError("Unable to track order. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const getCurrentStepIndex = (status) => {
    const index = STATUS_STEPS.findIndex(step => step.key === status);
    return index === -1 ? 0 : index;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getEstimatedDelivery = (status) => {
    const estimates = {
      "Scheduled": "2-3 business days",
      "Picked Up": "1-2 business days",
      "In Transit": "1 business day",
      "Out for Delivery": "Today",
      "Delivered": "Delivered",
      "Cancelled": "N/A",
    };
    return estimates[status] || "Calculating...";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-earth-50 to-white">
      {/* Header */}
      <header className="border-b border-earth-200 bg-white shadow-sm">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-earth-600 text-white">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">AgriLink</h1>
              <p className="text-xs text-slate-500">Order Tracking</p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        {/* Search Section */}
        <div className="mb-8 text-center">
          <h2 className="mb-2 text-3xl font-bold text-slate-900">Track Your Order</h2>
          <p className="mb-6 text-slate-600">Enter your Order ID to check the delivery status</p>

          <form onSubmit={handleSearch} className="mx-auto max-w-md">
            <div className="flex gap-2">
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="Enter Order ID (e.g., ORD123)"
                className="flex-1 rounded-xl border border-slate-300 px-4 py-3 text-center outline-none transition focus:border-earth-500 focus:ring-2 focus:ring-earth-200"
              />
              <button
                type="submit"
                disabled={loading || !orderId.trim()}
                className="flex items-center gap-2 rounded-xl bg-earth-600 px-6 py-3 font-semibold text-white transition hover:bg-earth-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <>
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Track
                  </>
                )}
              </button>
            </div>
          </form>

          {error && (
            <div className="mx-auto mt-4 max-w-md rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
              <p className="flex items-center gap-2">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </p>
            </div>
          )}
        </div>

        {/* Results Section */}
        {result && (
          <div className="space-y-6">
            {/* Status Overview Card */}
            <div className="rounded-2xl border border-earth-200 bg-white p-6 shadow-soft">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Order ID</p>
                  <p className="font-mono text-2xl font-bold text-slate-900">{result.orderId?._id || result.orderId}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Status</p>
                  <span className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-white ${STATUS_COLORS[result.status] || STATUS_COLORS["Scheduled"]}`}>
                    {(result.status || "Scheduled").toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Stepper UI */}
              <div className="mb-6">
                <div className="relative flex justify-between">
                  {/* Progress Bar */}
                  <div className="absolute left-0 top-4 h-1 w-full bg-slate-200">
                    <div
                      className="h-full bg-earth-500 transition-all duration-500"
                      style={{
                        width: `${(getCurrentStepIndex(result.status) / (STATUS_STEPS.length - 1)) * 100}%`,
                      }}
                    />
                  </div>

                  {/* Steps */}
                  {STATUS_STEPS.map((step, index) => {
                    const currentIndex = getCurrentStepIndex(result.status);
                    const isCompleted = index <= currentIndex;
                    const isCurrent = index === currentIndex;

                    return (
                      <div key={step.key} className="relative z-10 flex flex-col items-center">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm transition-all ${
                            isCompleted
                              ? "border-earth-500 bg-earth-500 text-white"
                              : "border-slate-300 bg-white text-slate-400"
                          } ${isCurrent ? "ring-4 ring-earth-200" : ""}`}
                        >
                          {isCompleted ? (
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            index + 1
                          )}
                        </div>
                        <span className={`mt-2 text-xs font-medium ${isCompleted || isCurrent ? "text-slate-900" : "text-slate-400"}`}>
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Estimated Delivery */}
              <div className="rounded-xl bg-earth-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-earth-100">
                    <svg className="h-5 w-5 text-earth-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Estimated Delivery</p>
                    <p className="font-semibold text-slate-900">{getEstimatedDelivery(result.status)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Delivery Location Map */}
              {result.deliveryLocation && (
                <div className="rounded-2xl border border-earth-200 bg-white p-5 shadow-soft">
                  <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
                    <svg className="h-5 w-5 text-earth-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Delivery Location
                  </h3>
                  <div className="overflow-hidden rounded-xl border border-earth-200">
                    <div className="h-48 bg-slate-100">
                      <iframe
                        title="Delivery Location"
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        style={{ border: 0 }}
                        src={`https://www.google.com/maps?q=${encodeURIComponent(result.deliveryLocation)}&output=embed`}
                        allowFullScreen
                      />
                    </div>
                    <div className="border-t border-earth-200 bg-white p-3">
                      <p className="text-sm text-slate-700">{result.deliveryLocation}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Customer Info */}
              <div className="space-y-4">
                <div className="rounded-2xl border border-earth-200 bg-white p-5 shadow-soft">
                  <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
                    <svg className="h-5 w-5 text-earth-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Recipient Details
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-slate-500">Name</p>
                      <p className="font-semibold text-slate-900">{result.customerName || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Phone</p>
                      <p className="font-mono text-slate-700">{result.customerPhone || result.recipientPhone || "N/A"}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-earth-200 bg-white p-5 shadow-soft">
                  <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
                    <svg className="h-5 w-5 text-earth-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 012-2h7a2 2 0 012 2v2H7v-2z" />
                    </svg>
                    Delivery Partner
                  </h3>
                  <p className="text-slate-700">{result.deliveryPartner || "To be assigned"}</p>
                </div>
              </div>
            </div>

            {/* Support Section */}
            <div className="rounded-2xl border border-earth-200 bg-earth-50 p-5 text-center">
              <p className="text-sm text-slate-600">
                Need help with your delivery?{" "}
                <a href="mailto:support@agrilink.com" className="font-semibold text-earth-700 hover:underline">
                  Contact Support
                </a>
              </p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!result && !error && !loading && (
          <div className="py-12 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-earth-100">
              <svg className="h-10 w-10 text-earth-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 012-2h7a2 2 0 012 2v2H7v-2z" />
              </svg>
            </div>
            <p className="text-slate-500">Enter your Order ID above to track your delivery</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-earth-200 bg-white py-6">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <p className="text-sm text-slate-500">© 2026 AgriLink. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default CustomerTrackingPage;
