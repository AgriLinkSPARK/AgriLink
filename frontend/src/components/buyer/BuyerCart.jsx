import PageCard from "../common/PageCard";

function money(value) {
  return `LKR ${Number(value || 0).toFixed(2)}`;
}

function BuyerCart({ cartItems, cartTotal, actions, handleCheckout, isProcessingCheckout }) {
  return (
    <PageCard title="Cart" subtitle="Update quantities or checkout.">
      {cartItems.length ? (
        <div className="grid gap-3">
          {cartItems.map((item) => (
            <div className="flex flex-col items-start justify-between gap-3 rounded-xl border border-earth-200 bg-earth-50/50 p-3 md:flex-row md:items-center" key={item.productId._id || item.productId}>
              <div className="flex items-center gap-4">
                {item.productId.mainImage && (
                  <img 
                    src={item.productId.mainImage} 
                    alt={item.productId.name} 
                    className="h-16 w-16 rounded-lg object-cover"
                  />
                )}
                <div>
                  <strong className="text-slate-900">{item.productId.name || "Product"}</strong>
                  <p className="text-sm text-slate-600">{money(item.productId.price || 0)}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-sm font-semibold text-slate-700" onClick={() => actions.updateCart(item.productId._id || item.productId, Math.max(1, item.quantity - 1))}>-</button>
                <span className="min-w-5 text-center font-semibold text-slate-700">{item.quantity}</span>
                <button type="button" className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-sm font-semibold text-slate-700" onClick={() => actions.updateCart(item.productId._id || item.productId, item.quantity + 1)}>+</button>
                <button type="button" className="rounded-md border border-red-200 bg-red-50 px-2.5 py-1 text-sm font-semibold text-red-700" onClick={() => actions.removeFromCart(item.productId._id || item.productId)}>Remove</button>
              </div>
            </div>
          ))}
          <div className="mt-2 text-right text-lg font-bold text-slate-900">Total: {money(cartTotal)}</div>
          <button 
            className="mt-2 rounded-xl bg-earth-600 px-4 py-2.5 font-semibold text-white transition hover:bg-earth-700 disabled:opacity-50" 
            type="button" 
            onClick={handleCheckout}
            disabled={isProcessingCheckout}
          >
            {isProcessingCheckout ? "Processing..." : "Checkout"}
          </button>
        </div>
      ) : <p className="text-slate-600">Your cart is empty.</p>}
    </PageCard>
  );
}

export default BuyerCart;
