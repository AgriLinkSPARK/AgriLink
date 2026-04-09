import { useEffect, useMemo, useState } from "react";
import AuthPanel from "./components/auth/AuthPanel";
import BuyerDashboard from "./components/buyer/BuyerDashboard";
import AdminDashboard from "./components/admin/AdminDashboard";
import FarmerDashboard from "./components/farmer/FarmerDashboard";
import HomePortal from "./components/common/HomePortal";
import { apiRequest } from "./services/api";
import { clearSession, loadSession, saveSession } from "./services/session";

const buyerLoginDefaults = { email: "", password: "" };
const buyerRegisterDefaults = { name: "", email: "", password: "" };
const farmerLoginDefaults = { email: "", password: "" };
const farmerRegisterDefaults = { name: "", email: "", password: "" };
const adminLoginDefaults = { email: "", password: "" };

function App() {
  const [session, setSession] = useState(() => loadSession());
  const [mode, setMode] = useState(session?.role === "admin" ? "admin" : session?.role === "farmer" ? "farmer" : "buyer");
  const [view, setView] = useState("login");
  const [authOpen, setAuthOpen] = useState(false);
  const [form, setForm] = useState(() => {
    if (session?.role === "admin") return adminLoginDefaults;
    if (session?.role === "farmer") return farmerLoginDefaults;
    return buyerLoginDefaults;
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [buyerState, setBuyerState] = useState(null);
  const [adminState, setAdminState] = useState(null);
  const [farmerState, setFarmerState] = useState(null);

  useEffect(() => {
    if (!session) return;

    const loadRoleData = async () => {
      if (!session.token) {
        setError("Session exists but token is missing. Try logging in again.");
        return;
      }

      setBusy(true);
      setError("");

      try {
        if (session.role === "farmer") {
          const [dashboard, storeRes] = await Promise.all([
            apiRequest("/auth/dashboard", { token: session.token }),
            apiRequest("/store", { token: session.token }).catch(() => ({ data: {} })),
          ]);

          const dashboardData = dashboard.data || {};
          const storeData = storeRes.data || storeRes || {};

          setFarmerState({
            user: dashboardData.user,
            store: storeData,
            products: storeData.products || [],
            orders: dashboardData.orders || [],
            totalRevenue: dashboardData.totalRevenue || 0,
            greeting: dashboard.message || "Welcome back",
          });
        } else if (session.role === "customer") {
          const [dashboard, products, cart, orders, profile, reviews] = await Promise.all([
            apiRequest("/customer/dashboard", { token: session.token }),
            apiRequest("/products/all", { token: session.token }),
            apiRequest("/cart", { token: session.token }),
            apiRequest("/orders/my-orders", { token: session.token }),
            apiRequest("/customer/profile", { token: session.token }),
            apiRequest("/reviews", { token: session.token }),
          ]);

          const dashboardData = dashboard.data || {};
          const productsData = products.data || [];
          const cartData = cart.data || cart || { items: [] };
          const ordersData = orders.data || orders || [];
          const profileData = profile.data || profile || {};
          const reviewsData = reviews.data || reviews || [];

          setBuyerState({
            user: dashboardData.user || profileData.user || profileData,
            products: productsData,
            cart: cartData,
            orders: ordersData,
            reviews: reviewsData,
            cartTotal: (cartData.items || []).reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.productId?.price || 0), 0),
            unpaidOrders: ordersData.filter((order) => order.paymentStatus !== "Paid" && order.status !== "Cancelled").length,
            greeting: dashboard.message || "Welcome back",
          });
        } else {
          const [usersRes, productsRes, logisticsRes] = await Promise.all([
            apiRequest("/admin/users", { token: session.token }),
            apiRequest("/products/all", { token: session.token }),
            apiRequest("/logistics", { token: session.token }),
          ]);

          const usersData = usersRes.users || usersRes.data || [];
          const productsData = productsRes.data || [];
          const logisticsData = logisticsRes.data || [];
          const logisticsPagination = logisticsRes.pagination || null;

          setAdminState({
            users: usersData,
            products: productsData,
            logistics: logisticsData,
            logisticsPagination,
            stores: [],
            customers: usersData.filter((entry) => entry.role === "customer").length,
            farmers: usersData.filter((entry) => entry.role === "farmer").length,
            greeting: usersRes.message || "Welcome back",
          });
        }
      } catch (fetchError) {
        setError(fetchError.message);
      } finally {
        setBusy(false);
      }
    };

    loadRoleData();
  }, [session]);

  const dashboardUser = useMemo(() => {
    if (!session) return null;
    if (session.role === "customer") return buyerState?.user;
    if (session.role === "farmer") return farmerState?.user || { name: session.name || "Farmer", email: session.email || "" };
    return { name: session.name || "Admin", email: session.email || "" };
  }, [session, buyerState, farmerState]);

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");

    try {
      let response;
      if (mode === "buyer" && view === "register") {
        response = await apiRequest("/auth/register/customer", { method: "POST", body: form });
      } else if (mode === "buyer") {
        response = await apiRequest("/auth/login/customer", { method: "POST", body: form });
      } else if (mode === "farmer" && view === "register") {
        response = await apiRequest("/auth/register/farmer", { method: "POST", body: form });
      } else if (mode === "farmer") {
        response = await apiRequest("/auth/login", { method: "POST", body: form });
      } else {
        response = await apiRequest("/auth/login", { method: "POST", body: form });
      }

      const authData = response.data || response;
      const token = authData?.token || response?.token;
      const role = authData?.role || response?.role || (mode === "buyer" ? "customer" : mode === "farmer" ? "farmer" : "admin");

      if (!token) {
        throw new Error("No token received from server. Response: " + JSON.stringify(response));
      }

      const nextSession = {
        token,
        role,
        name: form.name || form.email.split("@")[0],
        email: form.email,
      };

      saveSession(nextSession);
      setSession(nextSession);
      setAuthOpen(false);
      setForm(role === "admin" ? adminLoginDefaults : buyerLoginDefaults);
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setBusy(false);
    }
  }

  function logout() {
    clearSession();
    setSession(null);
    setBuyerState(null);
    setAdminState(null);
    setFarmerState(null);
    setAuthOpen(false);
    setForm(mode === "buyer" ? buyerLoginDefaults : mode === "farmer" ? farmerLoginDefaults : adminLoginDefaults);
    setView("login");
  }

  function openPortal(nextMode) {
    setMode(nextMode);
    setView("login");
    setAuthOpen(true);
    setForm(nextMode === "buyer" ? buyerLoginDefaults : nextMode === "farmer" ? farmerLoginDefaults : adminLoginDefaults);
    setError("");
  }

  function closeAuthModal() {
    setAuthOpen(false);
    setError("");
  }

  const buyerActions = {
    logout,
    addToCart: async (productId) => {
      await apiRequest("/cart/add", { method: "POST", token: session.token, body: { productId, quantity: 1 } });
      const cartRes = await apiRequest("/cart", { token: session.token });
      const cartData = cartRes.data || { items: [] };
      setBuyerState((current) => ({
        ...current,
        cart: cartData,
        cartTotal: (cartData.items || []).reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.productId?.price || 0), 0),
      }));
    },
    updateCart: async (productId, quantity) => {
      await apiRequest(`/cart/update/${productId}`, { method: "PUT", token: session.token, body: { quantity } });
      const cartRes = await apiRequest("/cart", { token: session.token });
      const cartData = cartRes.data || { items: [] };
      setBuyerState((current) => ({
        ...current,
        cart: cartData,
        cartTotal: (cartData.items || []).reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.productId?.price || 0), 0),
      }));
    },
    removeFromCart: async (productId) => {
      await apiRequest(`/cart/remove/${productId}`, { method: "DELETE", token: session.token });
      const cartRes = await apiRequest("/cart", { token: session.token });
      const cartData = cartRes.data || { items: [] };
      setBuyerState((current) => ({
        ...current,
        cart: cartData,
        cartTotal: (cartData.items || []).reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.productId?.price || 0), 0),
      }));
    },
    checkout: async () => {
      await apiRequest("/orders/checkout", { method: "POST", token: session.token });
      const [cartRes, ordersRes] = await Promise.all([
        apiRequest("/cart", { token: session.token }),
        apiRequest("/orders/my-orders", { token: session.token }),
      ]);
      const cartData = cartRes.data || { items: [] };
      const ordersData = ordersRes.data || ordersRes || [];
      setBuyerState((current) => ({
        ...current,
        cart: cartData,
        orders: ordersData,
        cartTotal: 0,
        unpaidOrders: ordersData.filter((order) => order.paymentStatus !== "Paid").length,
      }));
    },
    pay: async (orderId) => {
      await apiRequest(`/orders/pay/${orderId}`, { method: "PUT", token: session.token });
      const ordersRes = await apiRequest("/orders/my-orders", { token: session.token });
      const ordersData = ordersRes.data || ordersRes || [];
      setBuyerState((current) => ({ ...current, orders: ordersData, unpaidOrders: ordersData.filter((order) => order.paymentStatus !== "Paid").length }));
    },
    createPaymentIntent: async (orderId) => {
      const result = await apiRequest(`/payment/create-payment-intent/${orderId}`, { method: "POST", token: session.token });
      return result.clientSecret || result.data?.clientSecret || result;
    },
    cancel: async (orderId) => {
      await apiRequest(`/orders/cancel/${orderId}`, { method: "PUT", token: session.token });
      const ordersRes = await apiRequest("/orders/my-orders", { token: session.token });
      const ordersData = ordersRes.data || ordersRes || [];
      setBuyerState((current) => ({ ...current, orders: ordersData, unpaidOrders: ordersData.filter((order) => order.paymentStatus !== "Paid").length }));
    },
    sendMessage: async (payload) => apiRequest("/messages", { method: "POST", token: session.token, body: payload }),
    createReview: async (payload) => apiRequest("/reviews", { method: "POST", token: session.token, body: payload }),
    updateProfile: async (payload) => {
      await apiRequest("/customer/profile", { method: "PUT", token: session.token, body: payload });
      const profile = await apiRequest("/customer/profile", { token: session.token });
      setBuyerState((current) => ({ ...current, user: profile.user }));
    },
    trackDelivery: async (orderId) => {
      const response = await apiRequest(`/logistics/order/${orderId}`, { token: session.token });
      return response.data || response;
    },
  };

  const farmerActions = {
    logout,
    updateStore: async (payload) => {
      await apiRequest("/store", { method: "PUT", token: session.token, body: payload });
      const storeRes = await apiRequest("/store", { token: session.token }).catch(() => ({ data: {} }));
      setFarmerState((current) => ({ ...current, store: storeRes.data || storeRes }));
    },
    fetchInbox: async () => {
      const response = await apiRequest("/messages/inbox", { token: session.token });
      return response.data || response;
    },
  };

  const adminActions = {
    logout,
    createUser: async (payload) => {
      const created = await apiRequest("/admin/users", { method: "POST", token: session.token, body: payload });
      const usersRes = await apiRequest("/admin/users", { token: session.token });
      const users = usersRes.users || usersRes.data || [];
      setAdminState((current) => ({
        ...current,
        users,
        customers: users.filter((entry) => entry.role === "customer").length,
        farmers: users.filter((entry) => entry.role === "farmer").length,
      }));
      return created;
    },
    updateUser: async (userId, payload) => {
      const { password, ...profilePayload } = payload;

      if (typeof password === "string" && password.trim().length > 0) {
        await apiRequest(`/admin/users/${userId}/password`, {
          method: "PUT",
          token: session.token,
          body: { password: password.trim() },
        });
      }

      const updated = await apiRequest(`/admin/users/${userId}`, { method: "PUT", token: session.token, body: profilePayload });
      const usersRes = await apiRequest("/admin/users", { token: session.token });
      const users = usersRes.users || usersRes.data || [];
      setAdminState((current) => ({
        ...current,
        users,
        customers: users.filter((entry) => entry.role === "customer").length,
        farmers: users.filter((entry) => entry.role === "farmer").length,
      }));
      return updated;
    },
    deleteUser: async (userId) => {
      const deleted = await apiRequest(`/admin/users/${userId}`, { method: "DELETE", token: session.token });
      const usersRes = await apiRequest("/admin/users", { token: session.token });
      const users = usersRes.users || usersRes.data || [];
      setAdminState((current) => ({
        ...current,
        users,
        customers: users.filter((entry) => entry.role === "customer").length,
        farmers: users.filter((entry) => entry.role === "farmer").length,
      }));
      return deleted;
    },
    fetchLogistics: async (page = 1, limit = 10) => {
      const logisticsRes = await apiRequest(`/logistics?page=${page}&limit=${limit}`, { token: session.token });
      setAdminState((current) => ({
        ...current,
        logistics: logisticsRes.data || logisticsRes || [],
        logisticsPagination: logisticsRes.pagination || null,
      }));
    },
    createLogistics: async (payload) => {
      await apiRequest("/logistics", { method: "POST", token: session.token, body: payload });
      const logisticsRes = await apiRequest("/logistics", { token: session.token });
      setAdminState((current) => ({
        ...current,
        logistics: logisticsRes.data || logisticsRes || [],
        logisticsPagination: logisticsRes.pagination || null,
      }));
    },
    updateLogistics: async (id, status, notify) => {
      await apiRequest(`/logistics/${id}`, { method: "PUT", token: session.token, body: { status, notify } });
      const logisticsRes = await apiRequest("/logistics", { token: session.token });
      setAdminState((current) => ({
        ...current,
        logistics: logisticsRes.data || logisticsRes || [],
        logisticsPagination: logisticsRes.pagination || null,
      }));
    },
    deleteLogistics: async (id) => {
      await apiRequest(`/logistics/${id}`, { method: "DELETE", token: session.token });
      const logisticsRes = await apiRequest("/logistics", { token: session.token });
      setAdminState((current) => ({
        ...current,
        logistics: logisticsRes.data || logisticsRes || [],
        logisticsPagination: logisticsRes.pagination || null,
      }));
    },
  };

  if (session?.role === "customer" && buyerState) {
    return <BuyerDashboard data={buyerState} user={dashboardUser} loading={busy} error={error} actions={buyerActions} />;
  }

  if (session?.role === "farmer" && farmerState) {
    return <FarmerDashboard data={farmerState} user={dashboardUser} loading={busy} error={error} actions={farmerActions} />;
  }

  if (session?.role === "admin" && adminState) {
    return <AdminDashboard data={adminState} user={dashboardUser} loading={busy} error={error} actions={adminActions} />;
  }

  if (session) {
    if (error && !busy) {
      return (
        <main className="mx-auto max-w-6xl px-5 pb-14 pt-8">
          <header className="mb-6 rounded-2xl border border-red-200 bg-white/90 p-6 shadow-soft backdrop-blur-sm">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-earth-600">AgriLink</p>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">Unable to load dashboard</h1>
              <p className="mt-2 text-sm font-semibold text-red-700">{error}</p>
              <p className="mt-2 text-slate-600">Start backend on port 5000 and try again, or clear the current session.</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button className="rounded-xl bg-earth-600 px-4 py-2 font-semibold text-white transition hover:bg-earth-700" type="button" onClick={logout}>Go home</button>
                <button className="rounded-xl border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 transition hover:bg-slate-50" type="button" onClick={logout}>Clear session</button>
              </div>
            </div>
          </header>
        </main>
      );
    }

    return (
      <main className="mx-auto max-w-6xl px-5 pb-14 pt-8">
        <header className="mb-6 rounded-2xl border border-earth-200 bg-white/80 p-6 shadow-soft backdrop-blur-sm">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-earth-600">AgriLink</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">Loading dashboard</h1>
            <p className="mt-2 text-slate-600">Fetching your data from MongoDB-backed APIs.</p>
          </div>
        </header>
      </main>
    );
  }

  return (
    <>
      <HomePortal onSelectPortal={openPortal} />

      {authOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm">
          <div className="relative w-full max-w-5xl">
            <AuthPanel
              mode={mode}
              view={view}
              form={form}
              loading={busy}
              error={error}
              onModeChange={(nextMode) => {
                setMode(nextMode);
                setView("login");
                setForm(nextMode === "buyer" ? buyerLoginDefaults : nextMode === "farmer" ? farmerLoginDefaults : adminLoginDefaults);
              }}
              onViewChange={(nextView) => {
                setView(nextView);
                if (mode === "buyer" && nextView === "register") {
                  setForm(buyerRegisterDefaults);
                } else if (mode === "farmer" && nextView === "register") {
                  setForm(farmerRegisterDefaults);
                } else {
                  setForm(mode === "farmer" ? farmerLoginDefaults : buyerLoginDefaults);
                }
              }}
              onChange={(name, value) => setForm((current) => ({ ...current, [name]: value }))}
              onSubmit={handleSubmit}
              onBack={closeAuthModal}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}

export default App;