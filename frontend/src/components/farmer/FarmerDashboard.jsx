import { useCallback, useEffect, useMemo, useState } from "react";
import PageCard from "../common/PageCard";
import StatGrid from "../common/StatGrid";
import StoreUpdatePage from "./StoreUpdatePage";

function money(value) {
  return `LKR ${Number(value || 0).toFixed(2)}`;
}

function FarmerDashboard({ data, user, loading, error, actions, forceStoreSetup = false, onAddProduct, onEditProduct }) {
  const [activeSection, setActiveSection] = useState("store");
  const [isStoreEditorOpen, setIsStoreEditorOpen] = useState(false);
  const [isSavingTwoStep, setIsSavingTwoStep] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeletingProduct, setIsDeletingProduct] = useState(false);

  const stats = useMemo(() => [
    { label: "Store", value: data.store?.name || "My Store", note: "Farm marketplace" },
    { label: "Products", value: String(data.products?.length || 0), note: "Available for sale" },
    { label: "Orders", value: String(data.orders?.length || 0), note: "Received from buyers" },
    { label: "Revenue", value: money(data.totalRevenue || 0), note: "Sales so far" },
  ], [data.store?.name, data.products?.length, data.orders?.length, data.totalRevenue]);

  const filteredProducts = useMemo(() => {
    const products = Array.isArray(data.products) ? data.products : [];
    const query = productSearch.trim().toLowerCase();

    if (!query) {
      return products;
    }

    return products.filter((product) => {
      const name = String(product?.name || "").toLowerCase();
      const category = String(product?.category || "").toLowerCase();
      const description = String(product?.description || "").toLowerCase();
      return name.includes(query) || category.includes(query) || description.includes(query);
    });
  }, [data.products, productSearch]);

  if (forceStoreSetup || isStoreEditorOpen) {
    return (
      <StoreUpdatePage
        initialStore={data.store}
        loading={loading}
        error={error}
        onSubmit={actions.updateStore}
        onBack={forceStoreSetup ? null : () => setIsStoreEditorOpen(false)}
        isSetupMode={forceStoreSetup}
      />
    );
  }

  return (
    <div className="relative w-full overflow-hidden pb-14 pt-0">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(34,197,94,0.14),transparent_34%),radial-gradient(circle_at_88%_78%,rgba(16,185,129,0.12),transparent_38%)]" />
        <div className="absolute -left-20 top-40 h-72 w-72 rounded-full bg-green-300/20 blur-3xl" />
        <div className="absolute right-0 top-80 h-80 w-80 rounded-full bg-emerald-300/20 blur-3xl" />
        <div className="absolute -left-16 top-20 h-40 w-24 rotate-[-25deg] rounded-[100%_0_100%_0] bg-green-200/35" />
        <div className="absolute left-8 top-52 h-28 w-16 rotate-[20deg] rounded-[100%_0_100%_0] bg-green-300/30" />
        <div className="absolute right-10 top-24 h-44 w-24 rotate-[22deg] rounded-[100%_0_100%_0] bg-green-200/35" />
        <div className="absolute right-40 top-64 h-32 w-20 rotate-[-15deg] rounded-[100%_0_100%_0] bg-green-300/30" />
        <div className="absolute -left-8 bottom-20 h-36 w-20 rotate-[18deg] rounded-[100%_0_100%_0] bg-green-200/30" />
        <div className="absolute right-0 bottom-12 h-40 w-24 rotate-[-20deg] rounded-[100%_0_100%_0] bg-green-300/25" />
        <div className="absolute left-20 top-32 h-20 w-[2px] rotate-[-24deg] bg-green-500/25" />
        <div className="absolute right-24 top-36 h-24 w-[2px] rotate-[20deg] bg-green-500/25" />
        <div className="absolute left-6 bottom-28 h-20 w-[2px] rotate-[16deg] bg-green-500/20" />
        <div className="absolute right-10 bottom-24 h-24 w-[2px] rotate-[-18deg] bg-green-500/20" />
      </div>
      <div className="mb-6 w-full border border-green-300 bg-green-100 px-5 py-6 shadow-soft backdrop-blur-sm md:px-8">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-earth-600">Farmer workspace</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">{user?.name || "Farmer"}</h1>
          <p className="mt-2 text-slate-600">{forceStoreSetup ? "Complete store setup to unlock your dashboard." : "Manage your farm store, products, and buyer orders."}</p>
        </div>
        <button type="button" className="rounded-xl border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 transition hover:bg-slate-50" onClick={actions.logout}>Logout</button>
      </div>
      </div>

      <div className="mx-auto max-w-6xl px-5">

      <StatGrid items={stats} />

      <nav className="mb-4 rounded-2xl border border-earth-200 bg-white p-2 shadow-soft">
        <div className="flex flex-wrap gap-2">
          {[
            { id: "products", label: "Products" },
            { id: "orders", label: "Orders" },
            { id: "store", label: "My Store" },
            { id: "messages", label: "Messages" },
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

      {activeSection === "store" ? (
        <PageCard
          title="My Farm Store"
          actions={
            <button
              type="button"
              className="rounded-xl bg-earth-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-earth-700"
              onClick={() => setIsStoreEditorOpen(true)}
            >
              Update store
            </button>
          }
        >
          <div className="grid max-w-2xl gap-3 sm:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-earth-600">Store Name</p>
              <p className="text-base font-semibold text-slate-900">{data.store?.name || "Not set"}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-earth-600">Phone</p>
              <p className="text-base font-semibold text-slate-900">{data.store?.phone || "Not set"}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-earth-600">Location</p>
              <p className="text-base font-semibold text-slate-900">{data.store?.location || "Not set"}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-earth-600">Description</p>
              <p className="text-base text-slate-700">{data.store?.description || "No description added yet."}</p>
            </div>
          </div>
        </PageCard>
      ) : null}

      {activeSection === "products" ? (
        <PageCard
          title="My Products"
          actions={
            <button
              type="button"
              className="rounded-xl bg-earth-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-earth-700"
              onClick={() => onAddProduct && onAddProduct()}
            >
              Add products
            </button>
          }
        >
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search my products by name, category, or description"
              value={productSearch}
              onChange={(event) => setProductSearch(event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-earth-500 focus:ring-2 focus:ring-earth-200"
            />
          </div>

          {filteredProducts && filteredProducts.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((product) => (
                <article
                  key={product._id}
                  role="button"
                  tabIndex={0}
                  onClick={() => onEditProduct && onEditProduct(product)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onEditProduct && onEditProduct(product);
                    }
                  }}
                  className="relative overflow-hidden rounded-3xl border border-earth-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:cursor-pointer hover:shadow-md"
                >
                  <button
                    type="button"
                    className="absolute left-3 top-3 z-10 inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-700 shadow-sm transition hover:bg-red-100"
                    onClick={(event) => {
                      event.stopPropagation();
                      setProductToDelete(product);
                    }}
                    aria-label={`Delete ${product.name}`}
                  >
                    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current stroke-[2]">
                      <path d="M3 6h18" />
                      <path d="M8 6V4h8v2" />
                      <path d="M6 6l1 14h10l1-14" />
                      <path d="M10 11v6" />
                      <path d="M14 11v6" />
                    </svg>
                  </button>
                  <div className="pointer-events-none absolute right-3 top-3 z-10 inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-[11px] font-semibold text-green-700 shadow-sm">
                    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current stroke-[2]">
                      <path d="M4 20h4" />
                      <path d="M14.5 5.5l4 4L8 20H4v-4L14.5 5.5z" />
                      <path d="M13.5 6.5l4 4" />
                    </svg>
                  </div>
                  <div className="flex min-h-[260px] items-center justify-center bg-slate-50 p-5">
                    {product.mainImage ? (
                      <img
                        src={product.mainImage}
                        alt={product.name}
                        className="h-[220px] w-full object-contain"
                      />
                    ) : (
                      <div className="flex h-[220px] w-full items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white text-sm font-semibold text-slate-400">
                        No image available
                      </div>
                    )}
                  </div>
                  <div className="space-y-2 px-4 pb-4">
                    <div className="flex items-start justify-between gap-3">
                      <strong className="text-base font-semibold text-slate-900">{product.name}</strong>
                    </div>
                    <p className="text-sm text-earth-700">{product.category}</p>
                    <p className="text-base font-bold text-green-600">{money(product.price)} / Unit</p>
                    <p className="text-sm text-slate-600">{product.quantity} {product.unit} available</p>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="text-slate-600">
              {productSearch.trim()
                ? "No products match your search."
                : "No products listed yet. Use Add products to create your first item."}
            </p>
          )}
        </PageCard>
      ) : null}

      {activeSection === "orders" ? (
        <PageCard title="Orders from Buyers" subtitle="View orders received from marketplace buyers.">
          {data.orders && data.orders.length > 0 ? (
            <div className="grid gap-3">
              {data.orders.map((order) => (
                <div className="flex flex-col items-start justify-between gap-3 rounded-xl border border-earth-200 bg-earth-50/50 p-3 md:flex-row md:items-center" key={order._id}>
                  <div>
                    <strong className="text-slate-900">Order {order._id?.slice(-6) || "..."}</strong>
                    <p className="text-sm text-slate-600">{order.status} • Qty: {order.quantity || 1}</p>
                  </div>
                  <div className="text-sm font-semibold text-earth-700">{money(order.total || 0)}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-600">No orders received yet. Buyers will place orders here.</p>
          )}
        </PageCard>
      ) : null}

      {activeSection === "messages" ? (
        <PageCard title="Messages" subtitle="Inbox - Messages from buyers.">
          <MessagesInbox actions={actions} currentUser={user} />
        </PageCard>
      ) : null}

      {activeSection === "profile" ? (
        <PageCard title="Farmer Profile" subtitle="Your marketplace account details.">
          <div className="grid max-w-lg gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-earth-600">Name</p>
              <p className="text-lg font-semibold text-slate-900">{user?.name || "Farmer"}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-earth-600">Email</p>
              <p className="text-lg font-semibold text-slate-900">{user?.email || "farmer@agrilink.com"}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-earth-600">Role</p>
              <p className="text-lg font-semibold text-slate-900">Farmer</p>
            </div>
            <div className="mt-2 rounded-xl border border-earth-200 bg-earth-50/50 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-800">2-Step Verification</p>
                  <p className="text-xs text-slate-600">Require OTP verification by email for login.</p>
                </div>
                <button
                  type="button"
                  disabled={isSavingTwoStep}
                  onClick={async () => {
                    const nextValue = !data.user?.twoStepEnabled;
                    setIsSavingTwoStep(true);
                    try {
                      await actions.updateTwoStepPreference(nextValue);
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
          </div>
        </PageCard>
      ) : null}

      {productToDelete ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-green-200 bg-white p-6 shadow-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-green-700">Confirm deletion</p>
            <h3 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">Delete this product?</h3>
            {/* <p className="mt-3 text-sm leading-6 text-slate-600">
              This will permanently remove <span className="font-semibold text-slate-900">{productToDelete.name}</span> from your products list.
            </p> */}
            <p className="mt-2 text-sm font-semibold text-red-700">This will permanently remove <span className="font-semibold text-slate-900">{productToDelete.name}</span> from your products list.</p>
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 transition hover:bg-slate-50"
                onClick={() => setProductToDelete(null)}
                disabled={isDeletingProduct}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-xl bg-red-600 px-4 py-2 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
                onClick={async () => {
                  if (!actions.deleteProduct) {
                    return;
                  }

                  setIsDeletingProduct(true);
                  try {
                    await actions.deleteProduct(productToDelete._id);
                    setProductToDelete(null);
                  } finally {
                    setIsDeletingProduct(false);
                  }
                }}
                disabled={isDeletingProduct}
              >
                {isDeletingProduct ? "Deleting..." : "Delete product"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
      </div>
    </div>
  );
}

function MessagesInbox({ actions, currentUser }) {
  const [inbox, setInbox] = useState([]);
  const [selectedBuyer, setSelectedBuyer] = useState(null);
  const [inboxLoading, setInboxLoading] = useState(false);
  const [inboxError, setInboxError] = useState(null);

  const loadInbox = useCallback(async () => {
    setInboxLoading(true);
    setInboxError(null);
    try {
      const data = await actions.fetchInbox();
      const grouped = (data || []).reduce((acc, msg) => {
        const myId = String(currentUser?._id || currentUser?.id || "");
        const senderId = String(msg.senderId?._id || msg.senderId || "");

        // Group by the "other" person
        const isMeSender = senderId === myId;
        const otherPerson = isMeSender ? msg.receiverId : msg.senderId;
        const otherId = String(otherPerson?._id || otherPerson || "");

        if (!otherId) return acc;

        if (!acc[otherId]) {
          acc[otherId] = {
            otherPersonInfo: otherPerson,
            messages: [],
            lastMessage: msg,
          };
        }
        acc[otherId].messages.push(msg);
        if (new Date(msg.createdAt) > new Date(acc[otherId].lastMessage.createdAt)) {
          acc[otherId].lastMessage = msg;
        }
        return acc;
      }, {});
      setInbox(Object.values(grouped));
    } catch (err) {
      setInboxError(err.message || "Failed to load messages");
    } finally {
      setInboxLoading(false);
    }
  }, [actions, currentUser?._id, currentUser?.id]);

  useEffect(() => {
    loadInbox();
  }, [loadInbox]);

  const selectedConversation = selectedBuyer
    ? inbox.find((conv) => (conv.otherPersonInfo?._id || conv.otherPersonInfo) === selectedBuyer)
    : null;

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {/* Buyer List */}
      <div className="rounded-xl border border-earth-200 bg-white lg:col-span-1">
        <div className="border-b border-earth-200 p-3">
          <h3 className="font-semibold text-slate-800">Buyers</h3>
          <p className="text-xs text-slate-500">Select a buyer to view messages</p>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {inboxLoading ? (
            <div className="p-4 text-center">
              <div className="mx-auto mb-2 h-6 w-6 animate-spin rounded-full border-2 border-earth-300 border-t-earth-600"></div>
              <p className="text-sm text-slate-500">Loading...</p>
            </div>
          ) : inboxError ? (
            <div className="p-4 text-center text-red-600">
              <p className="text-sm">{inboxError}</p>
              <button
                onClick={loadInbox}
                className="mt-2 text-sm text-earth-600 hover:underline"
              >
                Retry
              </button>
            </div>
          ) : inbox.length === 0 ? (
            <div className="p-4 text-center text-slate-500">
              <p className="text-sm">No messages yet</p>
            </div>
          ) : (
            inbox.map((conversation) => {
              const otherId = conversation.otherPersonInfo?._id || conversation.otherPersonInfo;
              const otherName = conversation.otherPersonInfo?.name || "Unknown Buyer";
              const isSelected = selectedBuyer === otherId;
              const lastMsg = conversation.lastMessage;

              return (
                <button
                  key={otherId}
                  onClick={() => setSelectedBuyer(otherId)}
                  className={`w-full border-b border-slate-100 p-3 text-left transition hover:bg-earth-50/50 ${
                    isSelected ? "bg-earth-50 border-earth-200" : ""
                  }`}
                >
                  <p className="font-semibold text-slate-800">{otherName}</p>
                  <p className="truncate text-sm text-slate-500">{lastMsg?.messageText}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {lastMsg?.createdAt ? new Date(lastMsg.createdAt).toLocaleDateString() : ""}
                  </p>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Message Thread */}
      <div className="rounded-xl border border-earth-200 bg-white lg:col-span-2">
        {selectedConversation ? (
          <div className="flex h-96 flex-col">
            <div className="border-b border-earth-200 p-3">
              <h3 className="font-semibold text-slate-800">
                {selectedConversation.otherPersonInfo?.name || "Unknown Buyer"}
              </h3>
              <p className="text-xs text-slate-500">
                {selectedConversation.messages.length} message{selectedConversation.messages.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {[...selectedConversation.messages]
                .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
                .map((msg) => (
                  <div
                    key={msg._id}
                    className={`max-w-[80%] rounded-xl p-3 ${
                      String(msg.senderId?._id || msg.senderId || "") === String(currentUser?._id || currentUser?.id || "")
                        ? "ml-auto bg-earth-600 text-white"
                        : "bg-slate-100 text-slate-800"
                    }`}
                  >
                    <p className="text-sm">{msg.messageText}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {new Date(msg.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        ) : (
          <div className="flex h-96 items-center justify-center text-slate-500">
            <div className="text-center">
              <svg className="mx-auto mb-2 h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <p className="text-sm">Select a buyer to view messages</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default FarmerDashboard;
