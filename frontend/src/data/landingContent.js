export const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080/api";

export const AUTH_MODES = {
  buyer: {
    key: "buyer",
    label: "Buyer login",
    title: "Buyer Dashboard",
    subtitle: "Orders, favorites, and delivery tracking in one place.",
    endpoint: "/auth/login/customer",
    accent: "sunrise",
  },
  farmer: {
    key: "farmer",
    label: "Farmer login",
    title: "Farmer Dashboard",
    subtitle: "Manage your store, products, and buyer orders.",
    endpoint: "/auth/login",
    accent: "harvest",
  },
  admin: {
    key: "admin",
    label: "Admin login",
    title: "Admin Console",
    subtitle: "Users, inventory, and platform operations at a glance.",
    endpoint: "/auth/login",
    accent: "forest",
  },
};

export const DEMO_CREDENTIALS = {
  buyer: { email: "buyer@agrilink.test", password: "buyer123" },
  farmer: { email: "farmer@agrilink.test", password: "farmer123" },
  admin: { email: "admin@agrilink.test", password: "admin123" },
};

export const DASHBOARD_CONTENT = {
  buyer: {
    greeting: "Your marketplace is ready.",
    stats: [
      { label: "Active orders", value: "04", note: "+1 from yesterday" },
      { label: "Saved products", value: "12", note: "3 fresh arrivals" },
      { label: "Pending reviews", value: "02", note: "Help buyers and farmers" },
    ],
    cards: [
      {
        title: "Delivery tracker",
        body: "Track the next pickup window, courier handoff, and live delivery status.",
        badge: "On route",
      },
      {
        title: "Recommended produce",
        body: "Seasonal vegetables and grain bundles matched to your previous orders.",
        badge: "Fresh picks",
      },
      {
        title: "Support inbox",
        body: "Follow up on payment confirmations, substitutions, and refund requests.",
        badge: "2 unread",
      },
    ],
    activity: [
      "Order #AG-204 confirmed by Green Valley Farms.",
      "Payment received for your weekly veg basket.",
      "A new organic tomato bundle was added to your favorites.",
    ],
  },
  admin: {
    greeting: "Operations are under control.",
    stats: [
      { label: "Managed users", value: "1,248", note: "312 buyers active today" },
      { label: "Listings online", value: "386", note: "27 pending review" },
      { label: "Open issues", value: "08", note: "3 require immediate action" },
    ],
    cards: [
      {
        title: "Approval queue",
        body: "Review new seller registrations, product listings, and compliance checks.",
        badge: "High priority",
      },
      {
        title: "Inventory health",
        body: "Spot low stock items and rebalancing opportunities before demand spikes.",
        badge: "Healthy",
      },
      {
        title: "Platform alerts",
        body: "Watch failed payments, delivery exceptions, and unresolved support tickets.",
        badge: "3 urgent",
      },
    ],
    activity: [
      "Farmer onboarding review is waiting for approval.",
      "Two payment disputes were resolved in the last hour.",
      "Supply levels for maize and onions are trending upward.",
    ],
  },
};

export function readStoredSession() {
  try {
    const value = localStorage.getItem("agrilink-session");
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

export function normalizeAuthResponse(payload) {
  const data = payload?.data ?? payload ?? {};
  return {
    token: data.token ?? payload?.token ?? "",
    role: data.role ?? payload?.role ?? "",
    hasStore: data.hasStore ?? payload?.hasStore ?? null,
  };
}

export function getDashboardState(view, session) {
  const content = DASHBOARD_CONTENT[view];

  return {
    greeting: content.greeting,
    stats: content.stats,
    cards: content.cards,
    activity: content.activity,
    summary: {
      name: session?.name || (view === "buyer" ? "Buyer" : "Admin"),
      email: session?.email || (view === "buyer" ? "buyer@agrilink.test" : "admin@agrilink.test"),
      role: session?.role || view,
      accent: AUTH_MODES[view].accent,
    },
  };
}