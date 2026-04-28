import { useEffect, useMemo, useState } from "react";
import AuthPanel from "./components/auth/AuthPanel";
import BuyerDashboard from "./components/buyer/BuyerDashboard";
import BuyerStorePage from "./components/buyer/BuyerStorePage";
import BuyerProductPage from "./components/buyer/BuyerProductPage";
import AdminDashboard from "./components/admin/AdminDashboard";
import FarmerDashboard from "./components/farmer/FarmerDashboard";
import ProductCreatePage from "./components/farmer/ProductCreatePage";
import HomePortal from "./components/common/HomePortal";
import { AdminDashboardProvider } from "./context/AdminDashboardContext";
import { apiRequest } from "./services/api";
import { clearSession, loadSession, saveSession } from "./services/session";

const buyerLoginDefaults = { email: "", password: "" };
const buyerRegisterDefaults = { name: "", email: "", password: "" };
const farmerLoginDefaults = { email: "", password: "" };
const farmerRegisterDefaults = { name: "", email: "", password: "" };
const adminLoginDefaults = { email: "", password: "" };

function App() {
  // State management map (App-level): this block is the source of role/app state.
  // App.js lines ~21-39: useState hooks for session, UI mode, role-specific dashboard state.
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
  const [buyerStoreState, setBuyerStoreState] = useState({ loading: false, error: "", store: null, products: [] });
  const [buyerProductState, setBuyerProductState] = useState({ loading: false, error: "", product: null, reviews: [] });
  const [adminState, setAdminState] = useState(null);
  const [farmerState, setFarmerState] = useState(null);
  const [routePath, setRoutePath] = useState(() => window.location.pathname);

  useEffect(() => {
    const syncRoute = () => setRoutePath(window.location.pathname);

    window.addEventListener("popstate", syncRoute);
    return () => window.removeEventListener("popstate", syncRoute);
  }, []);

  function navigateTo(path) {
    if (window.location.pathname !== path) {
      window.history.pushState({}, "", path);
    }

    setRoutePath(path);
  }

  const isFarmerProductCreateRoute = routePath === "/farmer/products/new";
  const farmerProductEditMatch = routePath.match(/^\/farmer\/products\/([^/]+)\/edit$/);
  const buyerStoreMatch = routePath.match(/^\/buyer\/stores\/([^/]+)$/);
  const buyerStoreProductMatch = routePath.match(/^\/buyer\/stores\/([^/]+)\/products\/([^/]+)$/);
  const buyerProductMatch = routePath.match(/^\/buyer\/products\/([^/]+)$/);
  const editingProductId = farmerProductEditMatch?.[1] || null;
  const selectedBuyerStoreId = buyerStoreProductMatch?.[1] || buyerStoreMatch?.[1] || null;
  const selectedBuyerProductId = buyerStoreProductMatch?.[2] || buyerProductMatch?.[1] || null;

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
          if (session.requiresStoreSetup) {
            const storeRes = await apiRequest("/farmer/store", { token: session.token }).catch(() => ({ data: {} }));
            const storeData = storeRes.data || storeRes || {};

            setFarmerState({
              user: {
                name: session.name || "Farmer",
                email: session.email || "",
                role: "farmer",
                twoStepEnabled: Boolean(session.twoStepEnabled),
              },
              store: storeData,
              products: [],
              orders: [],
              totalRevenue: 0,
              greeting: "Set up your store to continue",
            });
            return;
          }

          const [dashboard, storeRes, twoStepPref] = await Promise.all([
            apiRequest("/auth/dashboard", { token: session.token }),
            apiRequest("/farmer/store", { token: session.token }).catch(() => ({ data: {} })),
            apiRequest("/auth/2step/preference", { token: session.token }).catch(() => ({ data: { twoStepEnabled: false } })),
          ]);

          const dashboardData = dashboard.data || {};
          const storeData = storeRes.data || storeRes || {};
          const twoStepData = twoStepPref.data || twoStepPref || {};

          setFarmerState({
            user: {
              ...(dashboardData.user || {}),
              twoStepEnabled: !!twoStepData.twoStepEnabled,
            },
            store: storeData,
            products: storeData.products || [],
            orders: dashboardData.orders || [],
            totalRevenue: dashboardData.totalRevenue || 0,
            greeting: dashboard.message || "Welcome back",
          });
        } else if (session.role === "customer") {
          const [dashboard, cart, orders, productsData, profile, reviews, twoStepPref] = await Promise.all([
            apiRequest("/auth/dashboard", { token: session.token }).catch(() => ({ data: {} })),
            apiRequest("/cart", { token: session.token }).catch(() => ({ data: { items: [] } })),
            apiRequest("/orders/my-orders", { token: session.token }).catch(() => ({ data: [] })),
            apiRequest("/products/all", { token: session.token }).catch(() => ({ data: { products: [], page: 1, pages: 1 } })),
            apiRequest("/customer/profile", { token: session.token }).catch(() => ({ data: {} })),
            apiRequest("/reviews", { token: session.token }).catch(() => ({ data: [] })),
            apiRequest("/auth/2step/preference", { token: session.token }).catch(() => ({ data: { twoStepEnabled: false } })),
          ]);

          const dashboardData = dashboard.data || {};
          const cartData = cart.data || { items: [] };
          const ordersData = orders.data || orders || [];
          const profileData = profile.data || profile || {};
          const productsResult = productsData.data || productsData || {};
          const reviewsData = reviews.data || reviews || [];
          const twoStepData = twoStepPref.data || twoStepPref || {};
          const combinedUser = dashboardData.user || profileData.user || profileData;

          setBuyerState({
            user: {
              ...(combinedUser || {}),
              twoStepEnabled: !!twoStepData.twoStepEnabled,
            },
            products: productsResult.products || [],
            productPage: productsResult.page || 1,
            productPages: productsResult.pages || 1,
            productFilters: { search: "", category: "all", page: 1 },
            cart: cartData,
            orders: ordersData,
            reviews: reviewsData,
            cartTotal: (cartData.items || []).reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.productId?.price || 0), 0),
            unpaidOrders: (ordersData || []).filter((order) => order.paymentStatus !== "Paid").length,
            greeting: dashboard.message || "Welcome back",
          });
        } else {
          const [usersRes, productsRes, logisticsRes, twoStepPref] = await Promise.all([
            apiRequest("/admin/users", { token: session.token }),
            apiRequest("/products/all", { token: session.token }),
            apiRequest("/logistics", { token: session.token }),
            apiRequest("/auth/2step/preference", { token: session.token }).catch(() => ({ data: { twoStepEnabled: false } })),
          ]);

          const usersData = usersRes.users || usersRes.data || [];
          const productsData = productsRes.data || [];
          const logisticsData = logisticsRes.data || [];
          const logisticsPagination = logisticsRes.pagination || null;
          const twoStepData = twoStepPref.data || twoStepPref || {};

          setAdminState({
            user: {
              name: session.name || "Admin",
              email: session.email || "",
              twoStepEnabled: !!twoStepData.twoStepEnabled,
            },
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
    return adminState?.user || { name: session.name || "Admin", email: session.email || "", twoStepEnabled: false };
  }, [session, buyerState, farmerState, adminState]);

  const editingProduct = useMemo(() => {
    if (!editingProductId || !farmerState?.products?.length) {
      return null;
    }

    return farmerState.products.find((product) => String(product._id) === String(editingProductId)) || null;
  }, [editingProductId, farmerState]);

  function buildProductFormData(payload) {
    const formData = new FormData();
    formData.append("name", payload.name);
    formData.append("category", payload.category);
    formData.append("description", payload.description || "");
    formData.append("price", payload.price);
    formData.append("quantity", payload.quantity);
    formData.append("unit", payload.unit || "kg");
    formData.append("harvestDate", payload.harvestDate || "");

    if (payload.mainImage) {
      formData.append("mainImage", payload.mainImage);
    }

    (payload.extraImages || []).forEach((file) => {
      formData.append("extraImages", file);
    });

    return formData;
  }

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

      if (authData?.requiresTwoStep && authData?.otpSessionId) {
        const otpInput = window.prompt("Enter the 6-digit OTP sent to your email");
        if (!otpInput) {
          throw new Error("OTP verification cancelled.");
        }

        const verified = await apiRequest("/auth/login/2step/verify-otp", {
          method: "POST",
          body: {
            otpSessionId: authData.otpSessionId,
            otp: otpInput.trim(),
          },
        });

        response = verified;
      }

      const finalAuthData = response?.data || response || authData;
      const token = finalAuthData?.token;
      const role = finalAuthData?.role || (mode === "buyer" ? "customer" : mode === "farmer" ? "farmer" : "admin");

      if (!token) {
        throw new Error("No token received from server. Response: " + JSON.stringify(response));
      }

      const nextSession = {
        token,
        role,
        name: form.name || form.email.split("@")[0],
        email: form.email,
        requiresStoreSetup: Boolean(finalAuthData?.requiresStoreSetup),
        twoStepEnabled: Boolean(finalAuthData?.twoStepEnabled),
      };

      saveSession(nextSession);
      setSession(nextSession);
      setAuthOpen(false);
      setForm(role === "admin" ? adminLoginDefaults : buyerLoginDefaults);
      if (role === "farmer") {
        navigateTo("/farmer/dashboard");
      }
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
    navigateTo("/");
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
    updateTwoStepPreference: async (enabled) => {
      const preferenceRes = await apiRequest("/auth/2step/preference", {
        method: "PATCH",
        token: session.token,
        body: { enabled },
      });
      const twoStepEnabled = !!(preferenceRes.data?.twoStepEnabled ?? preferenceRes.twoStepEnabled ?? enabled);
      setBuyerState((current) => ({
        ...current,
        user: {
          ...(current?.user || {}),
          twoStepEnabled,
        },
      }));
      return twoStepEnabled;
    },
    setProductFilters: async (newFilters) => {
      setBuyerState(current => {
        const updatedFilters = { ...current.productFilters, ...newFilters };
        
        // Trigger async load
        const params = new URLSearchParams();
        if (updatedFilters.search) params.append("search", updatedFilters.search);
        if (updatedFilters.category && updatedFilters.category !== "all") params.append("category", updatedFilters.category);
        if (updatedFilters.page) params.append("page", updatedFilters.page);
        
        apiRequest(`/products/all?${params.toString()}`, { token: session.token })
          .then(res => {
            const result = res.data || res;
            setBuyerState(latest => ({
              ...latest,
              products: result.products || [],
              productPage: result.page || 1,
              productPages: result.pages || 1,
              productFilters: updatedFilters
            }));
          });

        return { ...current, productFilters: updatedFilters };
      });
    },
    trackDelivery: async (orderId) => {
      const response = await apiRequest(`/logistics/order/${orderId}`, { token: session.token });
      return response.data || response;
    },
  };

  useEffect(() => {
    if (session?.role !== "customer" || !selectedBuyerStoreId) {
      return;
    }

    let ignore = false;

    const loadStoreData = async () => {
      setBuyerStoreState({ loading: true, error: "", store: null, products: [] });

      try {
        let page = 1;
        let pages = 1;
        const products = [];

        do {
          const response = await apiRequest(`/products/all?storeId=${selectedBuyerStoreId}&page=${page}&limit=30`, {
            token: session.token,
          });
          const result = response.data || response || {};
          products.push(...(result.products || []));
          pages = Number(result.pages || 1);
          page += 1;
        } while (page <= pages);

        const store = products[0]?.store || null;

        if (!ignore) {
          setBuyerStoreState({ loading: false, error: "", store, products });
        }
      } catch (storeError) {
        if (!ignore) {
          setBuyerStoreState({
            loading: false,
            error: storeError.message || "Failed to load store products",
            store: null,
            products: [],
          });
        }
      }
    };

    loadStoreData();

    return () => {
      ignore = true;
    };
  }, [session?.role, session?.token, selectedBuyerStoreId]);

  useEffect(() => {
    if (session?.role !== "customer" || !selectedBuyerProductId) {
      return;
    }

    let ignore = false;

    const loadProductDetails = async () => {
      setBuyerProductState({ loading: true, error: "", product: null, reviews: [] });

      try {
        const [productRes, reviewsRes] = await Promise.all([
          apiRequest(`/products/details/${selectedBuyerProductId}`, { token: session.token }),
          apiRequest(`/reviews?productId=${selectedBuyerProductId}`, { token: session.token }),
        ]);

        const product = productRes.data || productRes || null;
        const reviews = reviewsRes.data || reviewsRes || [];

        if (!ignore) {
          setBuyerProductState({ loading: false, error: "", product, reviews: Array.isArray(reviews) ? reviews : [] });
        }
      } catch (productError) {
        if (!ignore) {
          setBuyerProductState({
            loading: false,
            error: productError.message || "Failed to load product details",
            product: null,
            reviews: [],
          });
        }
      }
    };

    loadProductDetails();

    return () => {
      ignore = true;
    };
  }, [session?.role, session?.token, selectedBuyerProductId]);

  const farmerActions = {
    logout,
    updateStore: async (payload) => {
      const hasExistingStore = Boolean(farmerState?.store?._id || farmerState?.store?.name);

      if (hasExistingStore) {
        await apiRequest("/farmer/store", { method: "PUT", token: session.token, body: payload });
      } else {
        await apiRequest("/farmer/store", { method: "POST", token: session.token, body: payload });
      }

      const [dashboardRes, storeRes] = await Promise.all([
        apiRequest("/auth/dashboard", { token: session.token }).catch(() => ({ data: { user: {} } })),
        apiRequest("/farmer/store", { token: session.token }).catch(() => ({ data: {} })),
      ]);

      const dashboardData = dashboardRes.data || {};
      const storeData = storeRes.data || storeRes || {};

      setFarmerState((current) => ({
        ...current,
        user: dashboardData.user || current?.user,
        store: storeData,
        products: storeData.products || current?.products || [],
        orders: dashboardData.orders || current?.orders || [],
        totalRevenue: dashboardData.totalRevenue || current?.totalRevenue || 0,
      }));

      setSession((current) => {
        const updated = { ...current, requiresStoreSetup: false };
        saveSession(updated);
        return updated;
      });
    },
    createProduct: async (payload) => {
      const formData = buildProductFormData(payload);
      const created = await apiRequest("/products", { method: "POST", token: session.token, body: formData });
      const productsRes = await apiRequest("/products", { token: session.token });
      setFarmerState((current) => ({
        ...current,
        products: productsRes.data || productsRes || current?.products || [],
      }));
      return created;
    },
    updateProduct: async (productId, payload) => {
      const formData = buildProductFormData(payload);
      const updated = await apiRequest(`/products/${productId}`, { method: "PUT", token: session.token, body: formData });
      const productsRes = await apiRequest("/products", { token: session.token });
      setFarmerState((current) => ({
        ...current,
        products: productsRes.data || productsRes || current?.products || [],
      }));
      return updated;
    },
    deleteProduct: async (productId) => {
      const deleted = await apiRequest(`/products/${productId}`, { method: "DELETE", token: session.token });
      const productsRes = await apiRequest("/products", { token: session.token });
      setFarmerState((current) => ({
        ...current,
        products: productsRes.data || productsRes || current?.products || [],
      }));
      return deleted;
    },
    fetchInbox: async () => {
      const response = await apiRequest("/messages/inbox", { token: session.token });
      return response.data || response;
    },
    updateTwoStepPreference: async (enabled) => {
      const preferenceRes = await apiRequest("/auth/2step/preference", {
        method: "PATCH",
        token: session.token,
        body: { enabled },
      });
      const twoStepEnabled = !!(preferenceRes.data?.twoStepEnabled ?? preferenceRes.twoStepEnabled ?? enabled);
      setFarmerState((current) => ({
        ...current,
        user: {
          ...(current?.user || {}),
          twoStepEnabled,
        },
      }));
      return twoStepEnabled;
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
    updateTwoStepPreference: async (enabled) => {
      const preferenceRes = await apiRequest("/auth/2step/preference", {
        method: "PATCH",
        token: session.token,
        body: { enabled },
      });
      const twoStepEnabled = !!(preferenceRes.data?.twoStepEnabled ?? preferenceRes.twoStepEnabled ?? enabled);
      setAdminState((current) => ({
        ...current,
        user: {
          ...(current?.user || {}),
          twoStepEnabled,
        },
      }));
      return twoStepEnabled;
    },
  };

  const handleCreateProductSubmit = async (payload) => {
    await farmerActions.createProduct(payload);
    navigateTo("/farmer/dashboard");
  };

  const handleUpdateProductSubmit = async (payload) => {
    if (!editingProduct) {
      return;
    }

    await farmerActions.updateProduct(editingProduct._id, payload);
    navigateTo("/farmer/dashboard");
  };

  if (session?.role === "farmer" && farmerState && isFarmerProductCreateRoute) {
    return (
      <ProductCreatePage
        loading={busy}
        error={error}
        onSubmit={handleCreateProductSubmit}
        onBack={() => navigateTo("/farmer/dashboard")}
      />
    );
  }

  if (session?.role === "farmer" && farmerState && editingProduct) {
    return (
      <ProductCreatePage
        loading={busy}
        error={error}
        initialProduct={editingProduct}
        mode="edit"
        onSubmit={handleUpdateProductSubmit}
        onBack={() => navigateTo("/farmer/dashboard")}
      />
    );
  }

  if (session?.role === "customer" && buyerState && selectedBuyerProductId) {
    return (
      <BuyerProductPage
        product={buyerProductState.product}
        reviews={buyerProductState.reviews}
        loading={buyerProductState.loading}
        error={buyerProductState.error}
        onAddToCart={buyerActions.addToCart}
        onBack={() => {
          if (buyerStoreProductMatch?.[1]) {
            navigateTo(`/buyer/stores/${buyerStoreProductMatch[1]}`);
            return;
          }
          navigateTo("/");
        }}
      />
    );
  }

  if (session?.role === "customer" && buyerState && selectedBuyerStoreId) {
    return (
      <BuyerStorePage
        store={buyerStoreState.store}
        products={buyerStoreState.products}
        loading={buyerStoreState.loading}
        error={buyerStoreState.error}
        onAddToCart={buyerActions.addToCart}
        onViewProduct={(productId) => navigateTo(`/buyer/stores/${selectedBuyerStoreId}/products/${productId}`)}
        onBack={() => navigateTo("/")}
      />
    );
  }

  if (session?.role === "customer" && buyerState) {
    return (
      <BuyerDashboard
        data={buyerState}
        user={dashboardUser}
        loading={busy}
        error={error}
        actions={buyerActions}
        onViewStore={(storeId) => navigateTo(`/buyer/stores/${storeId}`)}
        onViewProduct={(productId) => navigateTo(`/buyer/products/${productId}`)}
      />
    );
  }

  if (session?.role === "farmer" && farmerState) {
    return (
      <FarmerDashboard
        data={farmerState}
        user={dashboardUser}
        loading={busy}
        error={error}
        actions={farmerActions}
        forceStoreSetup={Boolean(session?.requiresStoreSetup)}
        onAddProduct={() => navigateTo("/farmer/products/new")}
        onEditProduct={(product) => navigateTo(`/farmer/products/${product._id}/edit`)}
        onDeleteProduct={(product) => farmerActions.deleteProduct(product._id)}
      />
    );
  }

  if (session?.role === "admin" && adminState) {
    // State management map (Context wiring): App.js lines ~820-831.
    // Admin state/actions are provided here and consumed in AdminDashboard via useAdminDashboardContext.
    return (
      <AdminDashboardProvider
        value={{
          data: adminState,
          user: dashboardUser,
          loading: busy,
          error,
          actions: adminActions,
        }}
      >
        <AdminDashboard />
      </AdminDashboardProvider>
    );
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