import { useState } from "react";
import PageCard from "../common/PageCard";
import BuyerPayment from "./BuyerPayment";

function BuyerOrders({ orders, actions, handlePay, isProcessingPayment }) {
  const [activeTab, setActiveTab] = useState("pending");
  const [expandedOrders, setExpandedOrders] = useState({});

  const toggleOrder = (orderId) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  const money = (value) => `LKR ${Number(value || 0).toFixed(2)}`;

  const filteredOrders = orders.filter((order) => {
    if (activeTab === "pending") {
      // Show orders that are not Paid AND not Cancelled
      return order.paymentStatus !== "Paid" && order.status !== "Cancelled";
    }
    return order.paymentStatus === "Paid";
  });

  return (
    <PageCard title="Orders" subtitle="Check payment and cancel pending orders.">
      <div className="mb-6 flex gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("pending")}
          className={`flex-1 rounded-xl py-3 text-sm font-bold transition ${
            activeTab === "pending"
              ? "bg-earth-600 text-white shadow-md shadow-earth-200"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          Pending Orders ({orders.filter(o => o.paymentStatus !== "Paid" && o.status !== "Cancelled").length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("completed")}
          className={`flex-1 rounded-xl py-3 text-sm font-bold transition ${
            activeTab === "completed"
              ? "bg-earth-600 text-white shadow-md shadow-earth-200"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          Previous Orders ({orders.filter(o => o.paymentStatus === "Paid").length})
        </button>
      </div>

      <div className="grid gap-4">
        {filteredOrders.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-slate-500">No {activeTab} orders found.</p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const isExpanded = expandedOrders[order._id];
            return (
              <div className="flex flex-col gap-3 rounded-2xl border border-earth-200 bg-earth-50/50 p-4 shadow-sm" key={order._id}>
                <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="text-slate-900">Order #{order._id.slice(-6).toUpperCase()}</strong>
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${order.paymentStatus === "Paid" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                        {order.paymentStatus}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-600 font-medium">Status: {order.status} • Total: {money(order.totalPrice)}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button 
                      className="rounded-xl border border-earth-300 bg-white px-4 py-2 text-sm font-semibold text-earth-700 transition hover:bg-earth-100" 
                      type="button" 
                      onClick={() => toggleOrder(order._id)}
                    >
                      {isExpanded ? "Hide Details" : "View Details"}
                    </button>
                    <BuyerPayment 
                      order={order} 
                      actions={actions}
                    />
                    {order.status === "Pending" ? (
                      <button className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100" type="button" onClick={() => actions.cancel(order._id)}>
                        Cancel
                      </button>
                    ) : null}
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-2 animate-in fade-in slide-in-from-top-2 duration-300 rounded-xl border border-earth-100 bg-white/60 p-3">
                    <div className="mb-3 border-b border-earth-100 pb-2">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Full Order ID</p>
                      <code className="text-xs font-mono text-slate-600 break-all">{order._id}</code>
                    </div>
                    <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-earth-600">Order Items</h4>
                    <div className="divide-y divide-earth-100">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between py-2.5 text-sm">
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-800">{item.name}</span>
                            <span className="text-xs text-slate-500">Qty: {item.quantity} × {money(item.price)}</span>
                          </div>
                          <span className="font-bold text-earth-700">{money(item.quantity * item.price)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </PageCard>
  );
}

export default BuyerOrders;
