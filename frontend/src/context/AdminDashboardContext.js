import { createContext, useContext } from "react";

const AdminDashboardContext = createContext(null);

// State management map (context module): this file defines the admin context boundary.
// AdminDashboardContext.js lines ~1-12: Provider + hook used by App.js and AdminDashboard.jsx.
export function AdminDashboardProvider({ value, children }) {
  return <AdminDashboardContext.Provider value={value}>{children}</AdminDashboardContext.Provider>;
}

export function useAdminDashboardContext() {
  return useContext(AdminDashboardContext);
}
