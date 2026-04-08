import { useMemo, useState } from "react";
import PageCard from "../common/PageCard";
import StatGrid from "../common/StatGrid";
import BuyerCart from "./BuyerCart";
import BuyerOrders from "./BuyerOrders";

function money(value) {
  return `LKR ${Number(value || 0).toFixed(2)}`;
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
              {product.mainImage && (
                <div className="mb-3 overflow-hidden rounded-xl bg-gray-200 aspect-video">
                  <img 
                    src={product.mainImage} 
                    alt={product.name} 
                    className="h-full w-full object-cover transition duration-300 hover:scale-105"
                  />
                </div>
              )}
              <strong className="text-base font-bold text-slate-900">{product.name}</strong>
              <p className="mt-1 text-sm text-slate-600">{product.category} • {money(product.price)} • {product.quantity} {product.unit}</p>
              <button 
                type="button" 
                className="mt-3 rounded-lg border border-earth-300 bg-white px-3 py-1.5 text-sm font-semibold text-earth-700 transition hover:bg-earth-100 disabled:opacity-50" 
                onClick={() => handleAddToCart(product._id)}
                disabled={isProcessingCart === product._id}
              >
                {isProcessingCart === product._id ? "Adding..." : "Add to cart"}
              </button>
            </article>
          ))}
        </div>
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

      {activeSection === "messages" ? (
      <div className="mb-4 grid gap-4 lg:grid-cols-2">
        <PageCard title="Message support" subtitle="Send a message to another user by ID.">
          <form className="grid gap-3" onSubmit={(event) => { event.preventDefault(); actions.sendMessage({ senderId: user._id, receiverId: messageTarget, messageText }); setMessageText(""); }}>
            <input className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-earth-500 focus:ring-2 focus:ring-earth-200" placeholder="Receiver user ID" value={messageTarget} onChange={(event) => setMessageTarget(event.target.value)} required />
            <textarea className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-earth-500 focus:ring-2 focus:ring-earth-200" placeholder="Message" value={messageText} onChange={(event) => setMessageText(event.target.value)} rows={3} required />
            <button className="rounded-xl bg-earth-600 px-4 py-2.5 font-semibold text-white transition hover:bg-earth-700" type="submit">Send message</button>
          </form>
        </PageCard>

        <PageCard title="Write a review" subtitle="Save a product review to MongoDB.">
          <form className="grid gap-3" onSubmit={(event) => { event.preventDefault(); actions.createReview({ productId: reviewForm.productId, buyerId: user._id, rating: reviewForm.rating, comment: reviewForm.comment }); setReviewForm({ productId: selectedProduct?._id || "", rating: 5, comment: "" }); }}>
            <select className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-earth-500 focus:ring-2 focus:ring-earth-200" value={reviewForm.productId} onChange={(event) => setReviewForm((current) => ({ ...current, productId: event.target.value }))}>
              {data.products.map((product) => <option key={product._id} value={product._id}>{product.name}</option>)}
            </select>
            <select className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-earth-500 focus:ring-2 focus:ring-earth-200" value={reviewForm.rating} onChange={(event) => setReviewForm((current) => ({ ...current, rating: Number(event.target.value) }))}>
              {[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} stars</option>)}
            </select>
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