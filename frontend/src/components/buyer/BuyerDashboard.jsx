import { useMemo, useState } from "react";
import PageCard from "../common/PageCard";
import StatGrid from "../common/StatGrid";

function StarRating({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "2px",
            fontSize: "28px",
            lineHeight: 1,
            color: star <= (hovered || value) ? "#f59e0b" : "#d1d5db",
            transform: star <= (hovered || value) ? "scale(1.15)" : "scale(1)",
            transition: "color 0.15s, transform 0.15s",
            filter: star <= (hovered || value) ? "drop-shadow(0 0 4px #f59e0b88)" : "none",
          }}
          aria-label={`${star} star${star !== 1 ? "s" : ""}`}
        >
          ★
        </button>
      ))}
      <span style={{ marginLeft: "6px", fontSize: "13px", color: "#64748b", fontWeight: 600 }}>
        {hovered || value} / 5
      </span>
    </div>
  );
}

function Toast({ message, type, visible }) {
  const icons = { success: "✅", info: "✉️" };
  const colors = {
    success: { bg: "#f0fdf4", border: "#86efac", text: "#166534" },
    info:    { bg: "#eff6ff", border: "#93c5fd", text: "#1e40af" },
  };
  const c = colors[type] || colors.success;
  return (
    <div
      style={{
        position: "fixed",
        bottom: "28px",
        right: "28px",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: "10px",
        background: c.bg,
        border: `1.5px solid ${c.border}`,
        color: c.text,
        borderRadius: "14px",
        padding: "14px 20px",
        fontWeight: 600,
        fontSize: "15px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.13)",
        minWidth: "220px",
        pointerEvents: "none",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(18px)",
        transition: "opacity 0.32s ease, transform 0.32s ease",
      }}
      role="status"
      aria-live="polite"
    >
      <span style={{ fontSize: "20px" }}>{icons[type] || "✅"}</span>
      {message}
    </div>
  );
}

function money(value) {
  return `LKR ${Number(value || 0).toFixed(2)}`;
}

function TrackDeliverySection({ data, actions }) {
  const [orderId, setOrderId] = useState("");
  const [trackLoading, setTrackLoading] = useState(false);
  const [trackResult, setTrackResult] = useState(null);
  const [trackError, setTrackError] = useState(null);

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!orderId.trim()) return;

    setTrackLoading(true);
    setTrackError(null);
    setTrackResult(null);

    try {
      console.log("[Track] Starting tracking for order:", orderId.trim());
      const result = await actions.trackDelivery(orderId.trim());
      console.log("[Track] Result received:", result);
      setTrackResult(result);
    } catch (err) {
      console.error("[Track] Error:", err);
      setTrackError(err.message || "Invalid Order ID. Please try again.");
    } finally {
      setTrackLoading(false);
    }
  };

  const statusColors = {
    "Scheduled": "bg-amber-100 text-amber-700",
    "Picked Up": "bg-sky-100 text-sky-700",
    "In Transit": "bg-indigo-100 text-indigo-700",
    "Out for Delivery": "bg-orange-100 text-orange-700",
    "Delivered": "bg-emerald-100 text-emerald-700",
    "Cancelled": "bg-red-100 text-red-700",
    "Not Available": "bg-slate-100 text-slate-600",
  };

  const statusIcons = {
    "Scheduled": "📅",
    "Picked Up": "📦",
    "In Transit": "🚛",
    "Out for Delivery": "🛵",
    "Delivered": "✅",
    "Cancelled": "❌",
    "Not Available": "⏳",
  };

  const getStatusStep = (status) => {
    const steps = ["Scheduled", "Picked Up", "In Transit", "Out for Delivery", "Delivered"];
    return steps.indexOf(status);
  };

  return (
    <PageCard title="Track Your Delivery" subtitle="Enter your Order ID to check delivery status.">
      {/* Search Form */}
      <form onSubmit={handleTrack} className="mb-6 rounded-xl border border-earth-200 bg-earth-50/50 p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex-1">
            <label className="mb-1 block text-xs font-semibold text-slate-600">Order ID</label>
            <input
              type="text"
              placeholder="Enter your Order ID"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-earth-500 focus:ring-2 focus:ring-earth-200"
              disabled={trackLoading}
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={trackLoading || !orderId.trim()}
              className="w-full rounded-xl bg-earth-600 px-6 py-2.5 font-semibold text-white transition hover:bg-earth-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {trackLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Tracking...
                </span>
              ) : (
                "Track Delivery"
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Loading State */}
      {trackLoading && (
        <div className="py-8 text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-earth-300 border-t-earth-600"></div>
          <p className="text-slate-600">Tracking your order...</p>
        </div>
      )}

      {/* Error State */}
      {trackError && !trackLoading && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">{trackError}</span>
          </div>
        </div>
      )}

      {/* Result Display */}
      {trackResult && !trackLoading && (
        <div className="rounded-xl border border-earth-200 bg-white p-4">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="font-mono text-sm text-slate-500">Order ID</p>
              <p className="font-semibold text-slate-900">{trackResult.orderId?._id || trackResult.orderId || orderId}</p>
            </div>
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold ${statusColors[trackResult.status] || statusColors["Not Available"]}`}>
              <span>{statusIcons[trackResult.status] || ""}</span>
              {trackResult.status || "Not Available"}
            </span>
          </div>

          {/* Status Stepper */}
          <div className="relative mb-6">
            <div className="absolute left-0 top-3 h-0.5 w-full bg-slate-200">
              <div
                className="h-full bg-earth-500 transition-all"
                style={{
                  width: `${(() => {
                    const idx = getStatusStep(trackResult.status);
                    if (idx === -1) return "0%";
                    if (idx === 4) return "100%";
                    return `${(idx / 4) * 100}%`;
                  })()}`
                }}
              />
            </div>
            <div className="relative flex justify-between">
              {["Scheduled", "Picked Up", "In Transit", "Out for Delivery", "Delivered"].map((step, idx) => {
                const currentIdx = getStatusStep(trackResult.status);
                const isCompleted = idx <= currentIdx && currentIdx !== -1;
                const isCurrent = idx === currentIdx;

                return (
                  <div key={step} className="flex flex-col items-center">
                    <div className={`flex h-6 w-6 items-center justify-center rounded-full border-2 text-xs ${
                      isCompleted
                        ? "border-earth-500 bg-earth-500 text-white"
                        : "border-slate-300 bg-white text-slate-400"
                    } ${isCurrent ? "ring-2 ring-earth-200" : ""}`}>
                      {isCompleted ? "✓" : idx + 1}
                    </div>
                    <span className={`mt-1 text-xs ${isCompleted || isCurrent ? "text-slate-700" : "text-slate-400"}`}>
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Delivery Details */}
          <div className="grid gap-2 rounded-lg bg-earth-50/50 p-3 text-sm">
            {trackResult.deliveryLocation && (
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 text-earth-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-slate-700">{trackResult.deliveryLocation}</span>
              </div>
            )}
            {trackResult.pickupLocation && (
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 text-earth-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <span className="text-slate-700">Pickup: {trackResult.pickupLocation}</span>
              </div>
            )}
            {trackResult.deliveryPartner && (
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 text-earth-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-slate-700">Driver: {trackResult.deliveryPartner}</span>
              </div>
            )}
            {trackResult.expectedDeliveryDate && (
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 text-earth-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-slate-700">Expected: {new Date(trackResult.expectedDeliveryDate).toLocaleDateString()}</span>
              </div>
            )}
            {trackResult.actualDeliveryDate && (
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-emerald-700 font-medium">Delivered on: {new Date(trackResult.actualDeliveryDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick History - Show user's recent orders */}
      {data.orders?.length > 0 && (
        <div className="mt-6">
          <h4 className="mb-3 text-sm font-semibold text-slate-700">Your Recent Orders</h4>
          <div className="grid gap-2">
            {data.orders.slice(0, 5).map((order) => (
              <button
                key={order._id}
                onClick={() => {
                  setOrderId(order._id);
                  setTrackResult(null);
                  setTrackError(null);
                }}
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3 text-left transition hover:border-earth-300 hover:bg-earth-50/50"
              >
                <div>
                  <p className="font-mono text-sm font-medium text-slate-900">{order._id}</p>
                  <p className="text-xs text-slate-500">{order.paymentStatus} • {money(order.totalAmount)}</p>
                </div>
                <span className="text-xs text-earth-600 font-medium">Click to track</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </PageCard>
  );
}

function BuyerDashboard({ data, user, loading, error, actions }) {
  const [activeSection, setActiveSection] = useState("products");
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState(null);
  const [messageTarget, setMessageTarget] = useState("");
  const [messageText, setMessageText] = useState("");
  const [reviewForm, setReviewForm] = useState({ productId: data.products[0]?._id || "", rating: 5, comment: "" });
  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });
  const [toast, setToast] = useState({ visible: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast((t) => ({ ...t, visible: false })), 3000);
  };

  const cartItems = data.cart?.items || [];
  const cartTotal = data.cartTotal || 0;

  const stats = useMemo(() => [
    { label: "Products", value: String(data.products.length), note: "Ready to browse" },
    { label: "Cart items", value: String(cartItems.length), note: money(cartTotal) },
    { label: "Orders", value: String(data.orders.length), note: `${data.unpaidOrders} unpaid` },
    { label: "Reviews", value: String(data.reviews.length), note: "Saved in MongoDB" },
  ], [data.products.length, cartItems.length, cartTotal, data.orders.length, data.unpaidOrders, data.reviews.length]);

  const selectedProduct = data.products.find((product) => product._id === reviewForm.productId) || data.products[0];

  return (
    <div className="mx-auto max-w-6xl px-5 pb-14 pt-8">
      <Toast message={toast.message} type={toast.type} visible={toast.visible} />
      <div className="mb-6 flex flex-col justify-between gap-4 rounded-2xl border border-earth-200 bg-white/85 p-6 shadow-soft backdrop-blur-sm md:flex-row md:items-start">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-earth-600">Buyer workspace</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">{user?.name || "Buyer"}</h1>
          <p className="mt-2 text-slate-600">Simple dashboard for products, cart, orders, reviews, and profile.</p>
        </div>
        <button type="button" className="rounded-xl border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 transition hover:bg-slate-50" onClick={actions.logout}>Logout</button>
      </div>

      <StatGrid items={stats} />

      <nav className="mb-4 rounded-2xl border border-earth-200 bg-white p-2 shadow-soft">
        <div className="flex flex-wrap gap-2">
          {[
            { id: "products", label: "Products" },
            { id: "cart", label: "Cart" },
            { id: "orders", label: "Orders" },
            { id: "tracking", label: "Track Delivery" },
            { id: "messages", label: "Messages & Reviews" },
            { id: "profile", label: "Profile" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSection(tab.id)}
              className={activeSection === tab.id
                ? "rounded-xl bg-earth-600 px-4 py-2 text-sm font-semibold text-white"
                : "rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {loading ? <p className="mb-3 text-slate-600">Loading your data...</p> : null}
      {error ? <p className="mb-3 text-sm font-medium text-red-700">{error}</p> : null}

      {activeSection === "products" ? (
      <PageCard title="Products" subtitle="Browse products from farmers.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.products.map((product) => (
            <article className="rounded-2xl border border-earth-200 bg-earth-50/50 p-4" key={product._id}>
              <strong className="text-base font-bold text-slate-900">{product.name}</strong>
              <p className="mt-1 text-sm text-slate-600">{product.category} • {money(product.price)} • {product.quantity} {product.unit}</p>
              <button type="button" className="mt-3 rounded-lg border border-earth-300 bg-white px-3 py-1.5 text-sm font-semibold text-earth-700 transition hover:bg-earth-100" onClick={() => actions.addToCart(product._id)}>Add to cart</button>
            </article>
          ))}
        </div>
      </PageCard>
      ) : null}

      {activeSection === "cart" ? (
        <PageCard title="Cart" subtitle="Update quantities or checkout.">
          {cartItems.length ? (
            <div className="grid gap-3">
              {cartItems.map((item) => (
                <div className="flex flex-col items-start justify-between gap-3 rounded-xl border border-earth-200 bg-earth-50/50 p-3 md:flex-row md:items-center" key={item.productId._id || item.productId}>
                  <div>
                    <strong className="text-slate-900">{item.productId.name || "Product"}</strong>
                    <p className="text-sm text-slate-600">{money(item.productId.price || 0)}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button type="button" className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-sm font-semibold text-slate-700" onClick={() => actions.updateCart(item.productId._id || item.productId, Math.max(1, item.quantity - 1))}>-</button>
                    <span className="min-w-5 text-center font-semibold text-slate-700">{item.quantity}</span>
                    <button type="button" className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-sm font-semibold text-slate-700" onClick={() => actions.updateCart(item.productId._id || item.productId, item.quantity + 1)}>+</button>
                    <button type="button" className="rounded-md border border-red-200 bg-red-50 px-2.5 py-1 text-sm font-semibold text-red-700" onClick={() => actions.removeFromCart(item.productId._id || item.productId)}>Remove</button>
                  </div>
                </div>
              ))}
              <button className="rounded-xl bg-earth-600 px-4 py-2.5 font-semibold text-white transition hover:bg-earth-700" type="button" onClick={actions.checkout}>Checkout</button>
            </div>
          ) : <p className="text-slate-600">Your cart is empty.</p>}
        </PageCard>
      ) : null}

      {activeSection === "orders" ? (
        <PageCard title="Orders" subtitle="Check payment and cancel pending orders.">
          <div className="grid gap-3">
            {data.orders.map((order) => (
              <div className="flex flex-col items-start justify-between gap-3 rounded-xl border border-earth-200 bg-earth-50/50 p-3 md:flex-row md:items-center" key={order._id}>
                <div>
                  <strong className="text-slate-900">{order._id}</strong>
                  <p className="text-sm text-slate-600">{order.status} • {order.paymentStatus}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {order.paymentStatus !== "Paid" ? <button className="rounded-md border border-earth-300 bg-white px-3 py-1.5 text-sm font-semibold text-earth-700" type="button" onClick={() => actions.pay(order._id)}>Pay</button> : null}
                  {order.status === "Pending" ? <button className="rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-semibold text-red-700" type="button" onClick={() => actions.cancel(order._id)}>Cancel</button> : null}
                </div>
              </div>
            ))}
          </div>
        </PageCard>
      ) : null}

      {activeSection === "tracking" ? (
        <TrackDeliverySection data={data} actions={actions} />
      ) : null}

      {activeSection === "messages" ? (
      <div className="mb-4 grid gap-4 lg:grid-cols-2">
        <PageCard title="Message support" subtitle="Send a message to a farmer.">
          <form className="grid gap-3" onSubmit={(event) => { event.preventDefault(); actions.sendMessage({ senderId: user._id, receiverId: messageTarget, messageText }); setMessageText(""); showToast("Message sent! ✉️", "info"); }}>
            <label className="grid gap-1">
              <span className="text-sm font-semibold text-slate-700">Select Farmer</span>
              <select
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-earth-500 focus:ring-2 focus:ring-earth-200"
                value={messageTarget}
                onChange={(event) => setMessageTarget(event.target.value)}
                required
              >
                <option value="">-- Select a farmer --</option>
                {Array.from(new Map(data.products?.map(p => {
                  const farmer = p.store?.farmer;
                  return farmer ? [farmer._id, farmer] : null;
                }).filter(Boolean)).values()).map((farmer) => (
                  <option key={farmer._id} value={farmer._id}>{farmer.name}</option>
                ))}
              </select>
            </label>
            <textarea className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-earth-500 focus:ring-2 focus:ring-earth-200" placeholder="Message" value={messageText} onChange={(event) => setMessageText(event.target.value)} rows={3} required />
            <button className="rounded-xl bg-earth-600 px-4 py-2.5 font-semibold text-white transition hover:bg-earth-700" type="submit">Send message</button>
          </form>
        </PageCard>

        <PageCard title="Write a review" subtitle="Save a product review to MongoDB.">
          <form className="grid gap-3" onSubmit={(event) => { event.preventDefault(); actions.createReview({ productId: reviewForm.productId, buyerId: user._id, rating: reviewForm.rating, comment: reviewForm.comment }); setReviewForm({ productId: selectedProduct?._id || "", rating: 5, comment: "" }); showToast("Review submitted! ⭐", "success"); }}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <select className="flex-1 rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-earth-500 focus:ring-2 focus:ring-earth-200" value={reviewForm.productId} onChange={(event) => setReviewForm((current) => ({ ...current, productId: event.target.value }))}>
                {data.products.map((product) => <option key={product._id} value={product._id}>{product.name}</option>)}
              </select>
              <StarRating
                value={reviewForm.rating}
                onChange={(rating) => setReviewForm((current) => ({ ...current, rating }))}
              />
            </div>
            <textarea className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-earth-500 focus:ring-2 focus:ring-earth-200" placeholder="Comment" value={reviewForm.comment} onChange={(event) => setReviewForm((current) => ({ ...current, comment: event.target.value }))} rows={3} />
            <button className="rounded-xl bg-earth-600 px-4 py-2.5 font-semibold text-white transition hover:bg-earth-700" type="submit">Submit review</button>
          </form>
        </PageCard>
      </div>
      ) : null}

      {activeSection === "profile" ? (
      <PageCard title="Profile" subtitle="Update your buyer profile.">
        <form className="grid max-w-lg gap-3" onSubmit={(event) => { event.preventDefault(); actions.updateProfile(profileForm); }}>
          <input className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-earth-500 focus:ring-2 focus:ring-earth-200" value={profileForm.name} onChange={(event) => setProfileForm((current) => ({ ...current, name: event.target.value }))} />
          <input className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-earth-500 focus:ring-2 focus:ring-earth-200" value={profileForm.email} onChange={(event) => setProfileForm((current) => ({ ...current, email: event.target.value }))} />
          <input className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-earth-500 focus:ring-2 focus:ring-earth-200" value={profileForm.phone} onChange={(event) => setProfileForm((current) => ({ ...current, phone: event.target.value }))} placeholder="Phone" />
          <button className="rounded-xl bg-earth-600 px-4 py-2.5 font-semibold text-white transition hover:bg-earth-700" type="submit">Save profile</button>
        </form>
      </PageCard>
      ) : null}
    </div>
  );
}

export default BuyerDashboard;