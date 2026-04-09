import { useEffect, useMemo, useState } from "react";
import PageCard from "../common/PageCard";
import StatGrid from "../common/StatGrid";

function money(value) {
  return `LKR ${Number(value || 0).toFixed(2)}`;
}

function FarmerDashboard({ data, user, loading, error, actions }) {
  const [activeSection, setActiveSection] = useState("store");
  const [storeForm, setStoreForm] = useState({
    name: data.store?.name || "",
    description: data.store?.description || "",
    location: data.store?.location || "",
    phone: data.store?.phone || "",
  });

  // Messages/Inbox state
  const [inbox, setInbox] = useState([]);
  const [selectedBuyer, setSelectedBuyer] = useState(null);
  const [inboxLoading, setInboxLoading] = useState(false);
  const [inboxError, setInboxError] = useState(null);

  const stats = useMemo(() => [
    { label: "Store", value: data.store?.name || "My Store", note: "Farm marketplace" },
    { label: "Products", value: String(data.products?.length || 0), note: "Available for sale" },
    { label: "Orders", value: String(data.orders?.length || 0), note: "Received from buyers" },
    { label: "Revenue", value: money(data.totalRevenue || 0), note: "Sales so far" },
  ], [data.store?.name, data.products?.length, data.orders?.length, data.totalRevenue]);

  return (
    <div className="mx-auto max-w-6xl px-5 pb-14 pt-8">
      <div className="mb-6 flex flex-col justify-between gap-4 rounded-2xl border border-earth-200 bg-white/85 p-6 shadow-soft backdrop-blur-sm md:flex-row md:items-start">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-earth-600">Farmer workspace</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">{user?.name || "Farmer"}</h1>
          <p className="mt-2 text-slate-600">Manage your farm store, products, and buyer orders.</p>
        </div>
        <button type="button" className="rounded-xl border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 transition hover:bg-slate-50" onClick={actions.logout}>Logout</button>
      </div>

      <StatGrid items={stats} />

      <nav className="mb-4 rounded-2xl border border-earth-200 bg-white p-2 shadow-soft">
        <div className="flex flex-wrap gap-2">
          {[
            { id: "store", label: "My Store" },
            { id: "products", label: "Products" },
            { id: "orders", label: "Orders" },
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
        <PageCard title="My Farm Store" subtitle="Update your store information.">
          <form className="grid max-w-lg gap-3" onSubmit={(event) => {
            event.preventDefault();
            if (actions.updateStore) {
              actions.updateStore(storeForm);
            }
          }}>
            <label className="grid gap-1">
              <span className="text-sm font-semibold text-slate-700">Store Name</span>
              <input
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-earth-500 focus:ring-2 focus:ring-earth-200"
                value={storeForm.name}
                onChange={(event) => setStoreForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="My Farm Store"
              />
            </label>
            <label className="grid gap-1">
              <span className="text-sm font-semibold text-slate-700">Description</span>
              <textarea
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-earth-500 focus:ring-2 focus:ring-earth-200"
                value={storeForm.description}
                onChange={(event) => setStoreForm((current) => ({ ...current, description: event.target.value }))}
                placeholder="Tell buyers about your farm..."
                rows={3}
              />
            </label>
            <label className="grid gap-1">
              <span className="text-sm font-semibold text-slate-700">Location</span>
              <input
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-earth-500 focus:ring-2 focus:ring-earth-200"
                value={storeForm.location}
                onChange={(event) => setStoreForm((current) => ({ ...current, location: event.target.value }))}
                placeholder="Farm location"
              />
            </label>
            <label className="grid gap-1">
              <span className="text-sm font-semibold text-slate-700">Phone</span>
              <input
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-earth-500 focus:ring-2 focus:ring-earth-200"
                value={storeForm.phone}
                onChange={(event) => setStoreForm((current) => ({ ...current, phone: event.target.value }))}
                placeholder="+94 71 xxx xxxx"
              />
            </label>
            <button className="rounded-xl bg-earth-600 px-4 py-2.5 font-semibold text-white transition hover:bg-earth-700" type="submit">Save store info</button>
          </form>
        </PageCard>
      ) : null}

      {activeSection === "products" ? (
        <PageCard title="My Products" subtitle="View products listed in your store.">
          {data.products && data.products.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.products.map((product) => (
                <article className="rounded-2xl border border-earth-200 bg-earth-50/50 p-4" key={product._id}>
                  <strong className="text-base font-bold text-slate-900">{product.name}</strong>
                  <p className="mt-1 text-sm text-slate-600">{product.category} • {money(product.price)}</p>
                  <p className="mt-2 text-xs text-slate-500">{product.quantity} {product.unit} available</p>
                </article>
              ))}
            </div>
          ) : (
            <p className="text-slate-600">No products listed yet. Coming soon: add products feature.</p>
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
          <MessagesInbox actions={actions} />
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
          </div>
        </PageCard>
      ) : null}
    </div>
  );
}

function MessagesInbox({ actions }) {
  const [inbox, setInbox] = useState([]);
  const [selectedBuyer, setSelectedBuyer] = useState(null);
  const [inboxLoading, setInboxLoading] = useState(false);
  const [inboxError, setInboxError] = useState(null);

  useEffect(() => {
    loadInbox();
  }, []);

  const loadInbox = async () => {
    setInboxLoading(true);
    setInboxError(null);
    try {
      const data = await actions.fetchInbox();
      // Group messages by sender
      const grouped = (data || []).reduce((acc, msg) => {
        const senderId = msg.senderId?._id || msg.senderId;
        if (!acc[senderId]) {
          acc[senderId] = {
            sender: msg.senderId,
            messages: [],
            lastMessage: msg,
          };
        }
        acc[senderId].messages.push(msg);
        if (new Date(msg.createdAt) > new Date(acc[senderId].lastMessage.createdAt)) {
          acc[senderId].lastMessage = msg;
        }
        return acc;
      }, {});
      setInbox(Object.values(grouped));
    } catch (err) {
      setInboxError(err.message || "Failed to load messages");
    } finally {
      setInboxLoading(false);
    }
  };

  const selectedConversation = selectedBuyer
    ? inbox.find((conv) => (conv.sender?._id || conv.sender) === selectedBuyer)
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
              const senderId = conversation.sender?._id || conversation.sender;
              const senderName = conversation.sender?.name || "Unknown Buyer";
              const isSelected = selectedBuyer === senderId;
              const lastMsg = conversation.lastMessage;

              return (
                <button
                  key={senderId}
                  onClick={() => setSelectedBuyer(senderId)}
                  className={`w-full border-b border-slate-100 p-3 text-left transition hover:bg-earth-50/50 ${
                    isSelected ? "bg-earth-50 border-earth-200" : ""
                  }`}
                >
                  <p className="font-semibold text-slate-800">{senderName}</p>
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
                {selectedConversation.sender?.name || "Unknown Buyer"}
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
                      msg.senderId?._id === selectedBuyer || msg.senderId === selectedBuyer
                        ? "ml-auto bg-earth-100 text-slate-800"
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
