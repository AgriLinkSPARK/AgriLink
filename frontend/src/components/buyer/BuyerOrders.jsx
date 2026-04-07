import PageCard from "../common/PageCard";
import BuyerPayment from "./BuyerPayment";

function BuyerOrders({ orders, actions, handlePay, isProcessingPayment }) {
  return (
    <PageCard title="Orders" subtitle="Check payment and cancel pending orders.">
      <div className="grid gap-3">
        {orders.map((order) => (
          <div className="flex flex-col items-start justify-between gap-3 rounded-xl border border-earth-200 bg-earth-50/50 p-3 md:flex-row md:items-center" key={order._id}>
            <div>
              <strong className="text-slate-900">{order._id}</strong>
              <p className="text-sm text-slate-600">{order.status} • {order.paymentStatus}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <BuyerPayment 
                order={order} 
                actions={actions}
              />
              {order.status === "Pending" ? (
                <button className="rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-semibold text-red-700" type="button" onClick={() => actions.cancel(order._id)}>
                  Cancel
                </button>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </PageCard>
  );
}

export default BuyerOrders;
