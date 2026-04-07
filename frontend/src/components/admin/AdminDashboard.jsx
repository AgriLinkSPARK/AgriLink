import { useMemo, useState } from "react";
import PageCard from "../common/PageCard";
import StatGrid from "../common/StatGrid";
import LogisticsDashboard from "../logistics/LogisticsDashboard";
import CreateLogistics from "../logistics/CreateLogistics";
import LogisticsDetails from "../logistics/LogisticsDetails";
import UpdateStatus from "../logistics/UpdateStatus";
import DeleteLogisticsModal from "../logistics/DeleteLogisticsModal";

function AdminDashboard({ data, user, loading, error, actions }) {
  const [activeSection, setActiveSection] = useState("users");
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "customer" });
  const [userSearch, setUserSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", role: "customer", password: "" });

  // Logistics state
  const [showCreateLogistics, setShowCreateLogistics] = useState(false);
  const [selectedLogistics, setSelectedLogistics] = useState(null);
  const [showLogisticsDetails, setShowLogisticsDetails] = useState(false);
  const [showUpdateStatus, setShowUpdateStatus] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const filteredUsers = useMemo(() => {
    return data.users.filter((entry) => {
      const matchesRole = roleFilter === "all" || entry.role === roleFilter;
      const haystack = `${entry.name || ""} ${entry.email || ""}`.toLowerCase();
      const matchesSearch = userSearch.trim().length === 0 || haystack.includes(userSearch.trim().toLowerCase());
      return matchesRole && matchesSearch;
    });
  }, [data.users, roleFilter, userSearch]);

  const stats = useMemo(() => [
    { label: "Users", value: String(data.users.length), note: `${data.customers} buyers` },
    { label: "Products", value: String(data.products.length), note: "Catalog overview" },
    { label: "Logistics", value: String(data.logistics.length), note: "Delivery records" },
    { label: "Farmers", value: String(data.farmers), note: "Store owners" },
  ], [data.users.length, data.products.length, data.logistics.length, data.customers, data.farmers]);

  async function runAdminAction(task, successMessage) {
    setActionError("");
    setActionSuccess("");
    setIsSaving(true);

    try {
      const result = await task();
      if (successMessage) {
        setActionSuccess(successMessage);
      }
      return result;
    } catch (actionFailure) {
      setActionError(actionFailure.message || "Action failed");
      return null;
    } finally {
      setIsSaving(false);
    }
  }

  function openEditModal(item) {
    setActionError("");
    setActionSuccess("");
    setEditingUser(item);
    setEditForm({
      name: item.name || "",
      email: item.email || "",
      role: item.role || "customer",
      password: "",
    });
  }

  function closeEditModal() {
    setEditingUser(null);
  }

  return (
    <div className="mx-auto max-w-6xl px-5 pb-14 pt-8">
      <div className="mb-6 flex flex-col justify-between gap-4 rounded-2xl border border-earth-200 bg-white/85 p-6 shadow-soft backdrop-blur-sm md:flex-row md:items-start">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-earth-600">Admin workspace</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">{user?.name || "Admin"}</h1>
          <p className="mt-2 text-slate-600">Manage users, products, and logistics with a calm, simple interface.</p>
        </div>
        <button type="button" className="rounded-xl border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 transition hover:bg-slate-50" onClick={actions.logout}>Logout</button>
      </div>

      <StatGrid items={stats} />

      <nav className="mb-4 rounded-2xl border border-earth-200 bg-white p-2 shadow-soft">
        <div className="flex flex-wrap gap-2">
          {[
            { id: "users", label: "Users" },
            { id: "logistics", label: "Logistics" },
            { id: "products", label: "Products" },
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

      {activeSection === "users" ? (
        <section className="mb-4 rounded-2xl border border-earth-200 bg-white p-4 shadow-soft">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-800">User Directory</p>
              <p className="text-sm text-slate-600">Find, edit, and manage marketplace accounts quickly.</p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-semibold">
              <span className="rounded-full bg-earth-100 px-3 py-1 text-earth-700">Total: {data.users.length}</span>
              <span className="rounded-full bg-sky-100 px-3 py-1 text-sky-700">Visible: {filteredUsers.length}</span>
            </div>
          </div>
        </section>
      ) : null}

      {loading ? <p className="mb-3 text-slate-600">Loading admin data...</p> : null}
      {error ? <p className="mb-3 text-sm font-medium text-red-700">{error}</p> : null}
      {actionError ? <p className="mb-3 text-sm font-medium text-red-700">{actionError}</p> : null}
      {actionSuccess ? <p className="mb-3 text-sm font-medium text-earth-700">{actionSuccess}</p> : null}
      {createdCredentials ? (
        <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Temporary password for <strong>{createdCredentials.email}</strong>: <strong>{createdCredentials.password}</strong>
        </div>
      ) : null}

      {activeSection === "users" ? (
        <>
          <div className="mb-4 grid gap-4 lg:grid-cols-2">
            <PageCard title="Create user" subtitle="Create an admin, buyer, or farmer account.">
              <form className="grid gap-3" onSubmit={async (event) => {
                event.preventDefault();
                const created = await runAdminAction(async () => actions.createUser(newUser), "User created successfully");

                if (created?.user?.email && created?.user?.password) {
                  setCreatedCredentials({ email: created.user.email, password: created.user.password });
                } else {
                  setCreatedCredentials(null);
                }

                if (created) {
                  setNewUser({ name: "", email: "", role: "customer" });
                }
              }}>
                <input className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-earth-500 focus:ring-2 focus:ring-earth-200" placeholder="Name" value={newUser.name} onChange={(event) => setNewUser((current) => ({ ...current, name: event.target.value }))} required />
                <input className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-earth-500 focus:ring-2 focus:ring-earth-200" placeholder="Email" value={newUser.email} onChange={(event) => setNewUser((current) => ({ ...current, email: event.target.value }))} required />
                <select className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-earth-500 focus:ring-2 focus:ring-earth-200" value={newUser.role} onChange={(event) => setNewUser((current) => ({ ...current, role: event.target.value }))}>
                  <option value="admin">Admin</option>
                  <option value="customer">Buyer</option>
                  <option value="farmer">Farmer</option>
                </select>
                <button className="rounded-xl bg-earth-600 px-4 py-2.5 font-semibold text-white transition hover:bg-earth-700 disabled:cursor-not-allowed disabled:opacity-70" type="submit" disabled={isSaving}>{isSaving ? "Saving..." : "Create"}</button>
              </form>
            </PageCard>

            <PageCard title="Edit mode" subtitle="Click Edit on any row to open a popup editor.">
              <div className="grid gap-3 text-sm text-slate-600">
                <p>Use the table below to manage each user. Edit opens a popup, Delete removes the selected user after confirmation.</p>
                <p className="rounded-xl bg-earth-50 p-3 text-earth-800">Tip: search and filter first to narrow the table, then edit directly from the row actions.</p>
              </div>
            </PageCard>
          </div>

          <div className="mb-4 grid gap-3 rounded-2xl border border-earth-200 bg-white p-4 shadow-soft md:grid-cols-2">
            <input
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-earth-500 focus:ring-2 focus:ring-earth-200"
              placeholder="Search by name or email"
              value={userSearch}
              onChange={(event) => setUserSearch(event.target.value)}
            />
            <select
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-earth-500 focus:ring-2 focus:ring-earth-200"
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value)}
            >
              <option value="all">All roles</option>
              <option value="admin">Admin</option>
              <option value="customer">Buyer</option>
              <option value="farmer">Farmer</option>
            </select>
          </div>

          <PageCard title="Users" subtitle="Table-based CRUD management for all accounts.">
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 bg-white">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Role</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Created</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td className="px-4 py-8 text-sm text-slate-600" colSpan="5">No users match this filter.</td>
                      </tr>
                    ) : null}
                    {filteredUsers.map((item) => (
                      <tr key={item._id} className={item._id === editingUser?._id ? "bg-earth-50" : "bg-white"}>
                        <td className="px-4 py-4 text-sm font-semibold text-slate-900">{item.name}</td>
                        <td className="px-4 py-4 text-sm text-slate-700">{item.email}</td>
                        <td className="px-4 py-4 text-sm text-slate-700">
                          <span className="rounded-full bg-earth-100 px-2.5 py-1 text-xs font-semibold text-earth-700">{item.role}</span>
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-600">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "-"}</td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              className="rounded-lg border border-earth-300 bg-white px-3 py-1.5 text-sm font-semibold text-earth-700 transition hover:bg-earth-50"
                              onClick={() => openEditModal(item)}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-70"
                              onClick={async () => {
                                if (!window.confirm(`Delete ${item.name}? This cannot be undone.`)) {
                                  return;
                                }
                                await runAdminAction(async () => actions.deleteUser(item._id), "User deleted successfully");
                              }}
                              disabled={isSaving}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </PageCard>

          {editingUser ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 py-6">
              <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-earth-600">Edit User</p>
                    <h3 className="mt-1 text-2xl font-bold text-slate-900">{editingUser.name}</h3>
                    <p className="text-sm text-slate-600">Update account details from this popup.</p>
                  </div>
                  <button type="button" className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700" onClick={closeEditModal}>Close</button>
                </div>

                <form className="grid gap-3" onSubmit={async (event) => {
                  event.preventDefault();
                  const payload = {
                    name: editForm.name,
                    email: editForm.email,
                    role: editForm.role,
                  };
                  const trimmedPassword = editForm.password.trim();
                  if (trimmedPassword.length > 0) {
                    payload.password = trimmedPassword;
                  }
                  const updated = await runAdminAction(async () => actions.updateUser(editingUser._id, payload), "User updated successfully");
                  if (updated) {
                    closeEditModal();
                  }
                }}>
                  <input className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-earth-500 focus:ring-2 focus:ring-earth-200" placeholder="Name" value={editForm.name} onChange={(event) => setEditForm((current) => ({ ...current, name: event.target.value }))} required />
                  <input className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-earth-500 focus:ring-2 focus:ring-earth-200" placeholder="Email" type="email" value={editForm.email} onChange={(event) => setEditForm((current) => ({ ...current, email: event.target.value }))} required />
                  <select className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-earth-500 focus:ring-2 focus:ring-earth-200" value={editForm.role} onChange={(event) => setEditForm((current) => ({ ...current, role: event.target.value }))}>
                    <option value="admin">Admin</option>
                    <option value="customer">Buyer</option>
                    <option value="farmer">Farmer</option>
                  </select>
                  <input
                    className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-earth-500 focus:ring-2 focus:ring-earth-200"
                    type="password"
                    placeholder="New password (leave blank to keep current)"
                    value={editForm.password}
                    onChange={(event) => setEditForm((current) => ({ ...current, password: event.target.value }))}
                  />
                  {editForm.password && editForm.password.trim() && editForm.password.trim().length < 6 ? (
                    <p className="text-xs text-red-600">Password must be at least 6 characters</p>
                  ) : null}
                  <div className="flex flex-wrap gap-2">
                    <button 
                      className="rounded-xl bg-earth-600 px-4 py-2.5 font-semibold text-white transition hover:bg-earth-700 disabled:cursor-not-allowed disabled:opacity-70" 
                      type="submit" 
                      disabled={isSaving || (editForm.password && editForm.password.trim() && editForm.password.trim().length < 6)}
                    >
                      {isSaving ? "Saving..." : "Save changes"}
                    </button>
                    <button className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-50" type="button" onClick={closeEditModal}>Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          ) : null}
        </>
      ) : null}

      {activeSection === "logistics" ? (
        <LogisticsDashboard
          data={data}
          loading={loading}
          error={error}
          onViewDetails={(logistics) => {
            setSelectedLogistics(logistics);
            setShowLogisticsDetails(true);
          }}
          onCreateLogistics={() => setShowCreateLogistics(true)}
          onUpdateStatus={(logistics) => {
            setSelectedLogistics(logistics);
            setShowUpdateStatus(true);
          }}
          onDeleteLogistics={(logistics) => {
            setSelectedLogistics(logistics);
            setShowDeleteModal(true);
          }}
        />
      ) : null}

      {/* Logistics Modals */}
      <CreateLogistics
        isOpen={showCreateLogistics}
        onClose={() => setShowCreateLogistics(false)}
        onSubmit={async (formData) => {
          await runAdminAction(async () => {
            await actions.createLogistics(formData);
          }, "Logistics record created successfully");
        }}
        orders={data.orders || []}
      />

      <LogisticsDetails
        logistics={selectedLogistics}
        isOpen={showLogisticsDetails}
        onClose={() => {
          setShowLogisticsDetails(false);
          setSelectedLogistics(null);
        }}
        onUpdateStatus={(logistics) => {
          setShowLogisticsDetails(false);
          setSelectedLogistics(logistics);
          setShowUpdateStatus(true);
        }}
        onSendNotification={async (logistics) => {
          await runAdminAction(async () => {
            await actions.sendNotification?.(logistics._id);
          }, "Notification sent successfully");
        }}
      />

      <UpdateStatus
        logistics={selectedLogistics}
        isOpen={showUpdateStatus}
        onClose={() => {
          setShowUpdateStatus(false);
          setSelectedLogistics(null);
        }}
        onSubmit={async (id, status, notify) => {
          await runAdminAction(async () => {
            await actions.updateLogistics(id, status, notify);
          }, `Status updated to ${status.replace(/_/g, " ")}${notify ? " and customer notified" : ""}`);
        }}
      />

      <DeleteLogisticsModal
        logistics={selectedLogistics}
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedLogistics(null);
        }}
        onConfirm={async (id) => {
          await runAdminAction(async () => {
            await actions.deleteLogistics(id);
          }, "Logistics record deleted successfully");
        }}
      />

      {activeSection === "products" ? (
        <PageCard title="Products" subtitle="Read-only catalog overview.">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.products.map((product) => (
              <article className="rounded-2xl border border-earth-200 bg-earth-50/50 p-4" key={product._id}>
                <strong className="text-slate-900">{product.name}</strong>
                <p className="mt-1 text-sm text-slate-600">{product.category} • {product.availability}</p>
              </article>
            ))}
          </div>
        </PageCard>
      ) : null}
    </div>
  );
}

export default AdminDashboard;