import { useMemo, useState } from "react";

import PageCard from "../common/PageCard";
import Pagination from "../common/Pagination";



const STATUS_OPTIONS = [

  { value: "all", label: "All Status", color: "bg-slate-100 text-slate-700" },

  { value: "Scheduled", label: "Scheduled", color: "bg-amber-100 text-amber-700" },

  { value: "Picked Up", label: "Picked Up", color: "bg-blue-100 text-blue-700" },

  { value: "In Transit", label: "In Transit", color: "bg-purple-100 text-purple-700" },

  { value: "Out for Delivery", label: "Out for Delivery", color: "bg-orange-100 text-orange-700" },

  { value: "Delivered", label: "Delivered", color: "bg-emerald-100 text-emerald-700" },

  { value: "Cancelled", label: "Cancelled", color: "bg-red-100 text-red-700" },

];



function LogisticsDashboard({ data, loading, error, onViewDetails, onCreateLogistics, onUpdateStatus, onDeleteLogistics, pagination, onPageChange, orders = [], ordersPagination, onRefreshOrders }) {

  const [statusFilter, setStatusFilter] = useState("all");

  const [searchQuery, setSearchQuery] = useState("");

  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  const [activeTab, setActiveTab] = useState("orders"); // "orders" or "logistics"

  // Local pagination state for orders
  const [ordersPage, setOrdersPage] = useState(1);
  const itemsPerPage = 10;



  const kpiCards = useMemo(() => {

    const total = data.logistics?.length || 0;

    const scheduled = data.logistics?.filter(l => l.status === "Scheduled").length || 0;

    const inTransit = data.logistics?.filter(l => l.status === "In Transit").length || 0;

    const delivered = data.logistics?.filter(l => l.status === "Delivered").length || 0;

    const pickedUp = data.logistics?.filter(l => l.status === "Picked Up").length || 0;

    const outForDelivery = data.logistics?.filter(l => l.status === "Out for Delivery").length || 0;



    return [

      {

        label: "Total Deliveries",

        value: total,

        icon: "🚚",

        bgColor: "bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200",

        iconBg: "bg-slate-200/50",

        textColor: "text-slate-700",

        numberColor: "text-slate-900",

      },

      {

        label: "Scheduled",

        value: scheduled,

        icon: "📅",

        bgColor: "bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200",

        iconBg: "bg-amber-200/50",

        textColor: "text-amber-700",

        numberColor: "text-amber-900",

      },

      {

        label: "Picked Up",

        value: pickedUp,

        icon: "📦",

        bgColor: "bg-gradient-to-br from-sky-50 to-sky-100 border border-sky-200",

        iconBg: "bg-sky-200/50",

        textColor: "text-sky-700",

        numberColor: "text-sky-900",

      },

      {

        label: "In Transit",

        value: inTransit,

        icon: "🚛",

        bgColor: "bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200",

        iconBg: "bg-indigo-200/50",

        textColor: "text-indigo-700",

        numberColor: "text-indigo-900",

      },

      {

        label: "Out for Delivery",

        value: outForDelivery,

        icon: "🛵",

        bgColor: "bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200",

        iconBg: "bg-orange-200/50",

        textColor: "text-orange-700",

        numberColor: "text-orange-900",

      },

      {

        label: "Delivered",

        value: delivered,

        icon: "✅",

        bgColor: "bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200",

        iconBg: "bg-emerald-200/50",

        textColor: "text-emerald-700",

        numberColor: "text-emerald-900",

      },

    ];

  }, [data.logistics]);



  const filteredLogistics = useMemo(() => {

    if (!data.logistics) return [];

    

    return data.logistics.filter((item) => {

      const matchesStatus = statusFilter === "all" || item.status === statusFilter;

      const searchLower = searchQuery.toLowerCase();

      const matchesSearch = 

        !searchQuery || 

        (item.orderId?._id || item.orderId || "").toLowerCase().includes(searchLower) ||

        (item.customerName || "").toLowerCase().includes(searchLower) ||

        (item.deliveryLocation || "").toLowerCase().includes(searchLower);

      

      let matchesDate = true;

      if (dateRange.start && item.createdAt) {

        matchesDate = new Date(item.createdAt) >= new Date(dateRange.start);

      }

      if (dateRange.end && item.createdAt) {

        matchesDate = matchesDate && new Date(item.createdAt) <= new Date(dateRange.end);

      }

      

      return matchesStatus && matchesSearch && matchesDate;

    });

  }, [data.logistics, statusFilter, searchQuery, dateRange]);

  // Compute orders without logistics records
  const ordersWithoutLogistics = useMemo(() => {
    if (!orders || !data.logistics) return orders || [];
    
    const orderIdsWithLogistics = new Set(
      data.logistics.map(l => l.orderId?._id || l.orderId).filter(Boolean)
    );
    
    return orders.filter(order => !orderIdsWithLogistics.has(order._id));
  }, [orders, data.logistics]);

  // Pagination for orders without logistics
  const paginatedOrdersWithoutLogistics = useMemo(() => {
    const start = (ordersPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return ordersWithoutLogistics.slice(start, end);
  }, [ordersWithoutLogistics, ordersPage]);

  const totalOrdersPages = Math.ceil(ordersWithoutLogistics.length / itemsPerPage);

  const getStatusBadge = (status) => {

    const option = STATUS_OPTIONS.find(opt => opt.value === status) || STATUS_OPTIONS[0];

    return (

      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${option.color}`}>

        {option.label}

      </span>

    );

  };



  return (

    <div className="space-y-6">

      {/* KPI Cards */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">

        {kpiCards.map((card) => (

          <div

            key={card.label}

            className={`relative overflow-hidden rounded-2xl p-5 shadow-soft transition hover:shadow-md ${card.bgColor}`}

          >

            <div className="relative z-10">

              <div className={`mb-3 inline-flex rounded-xl ${card.iconBg} p-2`}>

                <span className="text-2xl">{card.icon}</span>

              </div>

              <p className={`text-sm font-medium ${card.textColor}`}>{card.label}</p>

              <p className={`text-3xl font-extrabold ${card.numberColor}`}>{card.value}</p>

            </div>

          </div>

        ))}

      </div>



      {/* Tab Navigation */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setActiveTab("orders")}
          className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
            activeTab === "orders"
              ? "bg-earth-600 text-white"
              : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          Orders Needing Delivery ({ordersWithoutLogistics.length})
        </button>
        <button
          onClick={() => setActiveTab("logistics")}
          className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
            activeTab === "logistics"
              ? "bg-earth-600 text-white"
              : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          Active Deliveries ({data.logistics?.length || 0})
        </button>
      </div>

      {/* Orders Tab */}
      {activeTab === "orders" && (
        <PageCard
          title="Orders Needing Delivery"
          subtitle="Select an order to create a logistics record"
          actions={
            <button
              onClick={onRefreshOrders}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Refresh Orders
            </button>
          }
        >
          {ordersWithoutLogistics.length === 0 ? (
            <div className="py-12 text-center">
              <svg className="mx-auto mb-3 h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-slate-600">All orders have logistics records assigned!</p>
              <p className="mt-2 text-sm text-slate-500">No orders need delivery creation.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 bg-white">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Order ID</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Customer</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Payment</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Total</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {paginatedOrdersWithoutLogistics.map((order) => (
                      <tr key={order._id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-4">
                          <span className="font-mono text-sm font-semibold text-slate-900">
                            {order._id}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{order.customer?.name || "Unknown"}</p>
                            <p className="text-xs text-slate-500">{order.customer?.phone || "No phone"}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                            order.status === "Pending" ? "bg-amber-100 text-amber-700" :
                            order.status === "Confirmed" ? "bg-blue-100 text-blue-700" :
                            order.status === "Shipped" ? "bg-purple-100 text-purple-700" :
                            order.status === "Delivered" ? "bg-emerald-100 text-emerald-700" :
                            order.status === "Cancelled" ? "bg-red-100 text-red-700" :
                            "bg-slate-100 text-slate-700"
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                            order.paymentStatus === "Paid" ? "bg-emerald-100 text-emerald-700" :
                            order.paymentStatus === "Failed" ? "bg-red-100 text-red-700" :
                            "bg-amber-100 text-amber-700"
                          }`}>
                            {order.paymentStatus}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm font-semibold text-slate-900">
                          LKR {Number(order.totalPrice || 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-600">
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "-"}
                        </td>
                        <td className="px-4 py-4">
                          <button
                            onClick={() => onCreateLogistics(order)}
                            className="rounded-lg bg-earth-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-earth-700"
                          >
                            Schedule Delivery
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pagination for Orders */}
          {totalOrdersPages > 1 ? (
            <Pagination
              currentPage={ordersPage}
              totalPages={totalOrdersPages}
              onPageChange={setOrdersPage}
              totalItems={ordersWithoutLogistics.length}
              itemsPerPage={itemsPerPage}
            />
          ) : ordersWithoutLogistics.length > 0 && (
            <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              Showing all <span className="font-semibold text-slate-900">{ordersWithoutLogistics.length}</span> orders
            </div>
          )}
        </PageCard>
      )}

      {/* Logistics Tab */}
      {activeTab === "logistics" && (
      <PageCard 

        title="Delivery Management" 

        subtitle="Track and manage all logistics operations"

        actions={

          <button

            onClick={() => setActiveTab("orders")}

            className="rounded-xl bg-earth-600 px-4 py-2 font-semibold text-white transition hover:bg-earth-700"

          >

            + Create New Delivery

          </button>

        }

      >

        {/* Filters */}

        <div className="mb-6 grid gap-4 rounded-xl border border-earth-200 bg-earth-50/50 p-4 md:grid-cols-4">

          <div>

            <label className="mb-1 block text-xs font-semibold text-slate-600">Search Order ID</label>

            <input

              type="text"

              placeholder="Search by Order ID..."

              value={searchQuery}

              onChange={(e) => setSearchQuery(e.target.value)}

              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-earth-500 focus:ring-2 focus:ring-earth-200"

            />

          </div>

          <div>

            <label className="mb-1 block text-xs font-semibold text-slate-600">Status</label>

            <select

              value={statusFilter}

              onChange={(e) => setStatusFilter(e.target.value)}

              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-earth-500 focus:ring-2 focus:ring-earth-200"

            >

              {STATUS_OPTIONS.map(opt => (

                <option key={opt.value} value={opt.value}>{opt.label}</option>

              ))}

            </select>

          </div>

          <div>

            <label className="mb-1 block text-xs font-semibold text-slate-600">From Date</label>

            <input

              type="date"

              value={dateRange.start}

              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}

              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-earth-500 focus:ring-2 focus:ring-earth-200"

            />

          </div>

          <div>

            <label className="mb-1 block text-xs font-semibold text-slate-600">To Date</label>

            <input

              type="date"

              value={dateRange.end}

              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}

              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-earth-500 focus:ring-2 focus:ring-earth-200"

            />

          </div>

        </div>



        {/* Delivery Table */}

        {loading ? (

          <div className="py-12 text-center">

            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-earth-300 border-t-earth-600"></div>

            <p className="text-slate-600">Loading logistics data...</p>

          </div>

        ) : error ? (

          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">

            {error}

          </div>

        ) : (

          <div className="overflow-hidden rounded-2xl border border-slate-200">

            <div className="overflow-x-auto">

              <table className="min-w-full divide-y divide-slate-200 bg-white">

                <thead className="bg-slate-50">

                  <tr>

                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Order ID</th>

                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Customer</th>

                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Location</th>

                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>

                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Created</th>

                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-200">

                  {filteredLogistics.length === 0 ? (

                    <tr>

                      <td className="px-4 py-12 text-center text-sm text-slate-600" colSpan="6">

                        <div className="flex flex-col items-center gap-2">

                          <svg className="h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">

                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />

                          </svg>

                          <p>No deliveries found matching your filters.</p>

                        </div>

                      </td>

                    </tr>

                  ) : (

                    filteredLogistics.map((item) => (

                      <tr key={item._id} className="hover:bg-slate-50/50">

                        <td className="px-4 py-4">

                          <span className="font-mono text-sm font-semibold text-slate-900">

                            {item.orderId?._id || item.orderId || "N/A"}

                          </span>

                        </td>

                        <td className="px-4 py-4">

                          <div>

                            <p className="text-sm font-semibold text-slate-900">{item.customerName || "N/A"}</p>

                            <p className="text-xs text-slate-500">{item.customerPhone || "No phone"}</p>

                          </div>

                        </td>

                        <td className="px-4 py-4">

                          <div className="flex items-center gap-1 text-sm text-slate-700">

                            <svg className="h-4 w-4 text-earth-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">

                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />

                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />

                            </svg>

                            <span className="truncate max-w-[150px]">{item.deliveryLocation || "N/A"}</span>

                          </div>

                        </td>

                        <td className="px-4 py-4">{getStatusBadge(item.status)}</td>

                        <td className="px-4 py-4 text-sm text-slate-600">

                          {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "-"}

                        </td>

                        <td className="px-4 py-4">

                          <div className="flex flex-wrap gap-2">

                            <button

                              onClick={() => onViewDetails(item)}

                              className="rounded-lg border border-earth-300 bg-white px-3 py-1.5 text-sm font-semibold text-earth-700 transition hover:bg-earth-50"

                            >

                              View

                            </button>

                            <button

                              onClick={() => onUpdateStatus(item)}

                              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"

                            >

                              Update

                            </button>

                            <button

                              onClick={() => onDeleteLogistics(item)}

                              className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-semibold text-red-700 transition hover:bg-red-100"

                            >

                              Delete

                            </button>

                          </div>

                        </td>

                      </tr>

                    ))

                  )}

                </tbody>

              </table>

            </div>

            {/* Pagination for Logistics */}
            {pagination && pagination.totalPages > 1 ? (
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={onPageChange}
                totalItems={pagination.totalRecords}
                itemsPerPage={pagination.recordsPerPage}
              />
            ) : pagination && pagination.totalRecords > 0 ? (
              <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                Showing all <span className="font-semibold text-slate-900">{pagination.totalRecords}</span> deliveries
              </div>
            ) : null}

            {/* Fallback count display when no pagination object */}
            {!pagination && filteredLogistics.length > 0 && (
              <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
                Showing {filteredLogistics.length} of {data.logistics?.length || 0} deliveries
              </div>
            )}

          </div>

        )}

      </PageCard>
      )}

    </div>

  );

}



export default LogisticsDashboard;

