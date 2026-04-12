import { useMemo, useState } from "react";
import PageCard from "../common/PageCard";
import StatGrid from "../common/StatGrid";
import BuyerCart from "./BuyerCart";
import BuyerOrders from "./BuyerOrders";

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
  const [messageTarget, setMessageTarget] = useState("");
  const [messageText, setMessageText] = useState("");
  const [reviewForm, setReviewForm] = useState({ productId: data.products[0]?._id || "", rating: 5, comment: "" });
  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });
  const [toast, setToast] = useState({ visible: false, message: "", type: "success" });
  const [isSavingTwoStep, setIsSavingTwoStep] = useState(false);

  const showToast = (message, type = "success") => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast((t) => ({ ...t, visible: false })), 3000);
  };

  const [isProcessingCart, setIsProcessingCart] = useState(false);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const handleAddToCart = async (productId) => {
    setIsProcessingCart(productId);
    try {
      await actions.addToCart(productId);
      setActiveSection("cart");
    } finally {
      setIsProcessingCart(false);
    }
  };

  const handleCheckout = async () => {
    setIsProcessingCheckout(true);
    try {
      await actions.checkout();
      setActiveSection("orders");
    } finally {
      setIsProcessingCheckout(false);
    }
  };

  const handlePay = async (orderId) => {
    setIsProcessingPayment(orderId);
    try {
      // Simulate real-world stripe redirect or modal processing time
      await new Promise((resolve) => setTimeout(resolve, 800));
      await actions.pay(orderId);
    } finally {
      setIsProcessingPayment(false);
    }
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
      <PageCard title="Products" subtitle="Browse, search, and filter products from farmers.">
        <div className="mb-6 grid gap-3 md:grid-cols-3">
          <div className="md:col-span-2">
            <input 
              type="text"
              placeholder="Search products..."
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none transition focus:border-earth-500 focus:ring-2 focus:ring-earth-200"
              value={data.productFilters?.search || ""}
              onChange={(e) => actions.setProductFilters({ search: e.target.value })}
            />
          </div>
          <select 
            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none transition focus:border-earth-500 focus:ring-2 focus:ring-earth-200"
            value={data.productFilters?.category || "all"}
            onChange={(e) => actions.setProductFilters({ category: e.target.value })}
          >
            <option value="all">All Categories</option>
            <option value="Vegetables">Vegetables</option>
            <option value="Fruits">Fruits</option>
            <option value="Grains">Grains</option>
            <option value="Dairy">Dairy</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {data.products.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-slate-500 text-lg">No products found matching your criteria.</p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.products.map((product) => (
                <article className="rounded-2xl border border-earth-200 bg-earth-50/50 p-4 flex flex-col" key={product._id}>
                  {product.mainImage && (
                    <div className="mb-3 overflow-hidden rounded-xl bg-gray-200 aspect-video">
                      <img 
                        src={product.mainImage} 
                        alt={product.name} 
                        className="h-full w-full object-cover transition duration-300 hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <strong className="text-base font-bold text-slate-900">{product.name}</strong>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-earth-600">{product.category}</p>
                    <p className="mt-1 text-sm text-slate-600 line-clamp-2">{product.description}</p>
                    <p className="mt-2 text-sm font-bold text-slate-900">{money(product.price)} per {product.unit}</p>
                    <p className="text-xs text-slate-500">{product.quantity} {product.unit} available</p>
                  </div>
                  <button 
                    type="button" 
                    className="mt-4 w-full rounded-xl border border-earth-300 bg-white px-3 py-2 text-sm font-semibold text-earth-700 transition hover:bg-earth-600 hover:text-white disabled:opacity-50" 
                    onClick={() => handleAddToCart(product._id)}
                    disabled={isProcessingCart === product._id}
                  >
                    {isProcessingCart === product._id ? "Adding..." : "Add to cart"}
                  </button>
                </article>
              ))}
            </div>

            {/* Pagination Controls */}
            {data.productPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 disabled:opacity-30"
                  disabled={data.productPage <= 1}
                  onClick={() => actions.setProductFilters({ page: data.productPage - 1 })}
                >
                  Previous
                </button>
                <div className="flex gap-1">
                  {[...Array(data.productPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      className={`h-8 w-8 rounded-lg text-sm font-bold transition ${
                        data.productPage === i + 1
                          ? "bg-earth-600 text-white"
                          : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                      onClick={() => actions.setProductFilters({ page: i + 1 })}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 disabled:opacity-30"
                  disabled={data.productPage >= data.productPages}
                  onClick={() => actions.setProductFilters({ page: data.productPage + 1 })}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </PageCard>
      ) : null}

      {activeSection === "cart" ? (
        <BuyerCart 
          cartItems={cartItems} 
          cartTotal={cartTotal} 
          actions={actions} 
          handleCheckout={handleCheckout} 
          isProcessingCheckout={isProcessingCheckout} 
        />
      ) : null}

      {activeSection === "orders" ? (
        <BuyerOrders 
          orders={data.orders} 
          actions={actions} 
          handlePay={handlePay} 
          isProcessingPayment={isProcessingPayment} 
        />
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

        <div className="mt-5 max-w-lg rounded-xl border border-earth-200 bg-earth-50/50 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-800">2-Step Verification</p>
              <p className="text-xs text-slate-600">Require OTP verification by email when logging in.</p>
            </div>
            <button
              type="button"
              disabled={isSavingTwoStep}
              onClick={async () => {
                const nextValue = !data.user?.twoStepEnabled;
                setIsSavingTwoStep(true);
                try {
                  await actions.updateTwoStepPreference(nextValue);
                  showToast(`2-step verification ${nextValue ? "enabled" : "disabled"}.`, "success");
                } catch (toggleError) {
                  showToast(toggleError.message || "Failed to update 2-step setting.", "info");
                } finally {
                  setIsSavingTwoStep(false);
                }
              }}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${data.user?.twoStepEnabled ? "bg-emerald-600 text-white hover:bg-emerald-700" : "bg-slate-700 text-white hover:bg-slate-800"} disabled:cursor-not-allowed disabled:opacity-70`}
            >
              {isSavingTwoStep ? "Saving..." : data.user?.twoStepEnabled ? "On" : "Off"}
            </button>
          </div>
        </div>
      </PageCard>
      ) : null}
    </div>
  );
}

export default BuyerDashboard;