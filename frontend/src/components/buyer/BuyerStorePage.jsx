import { useMemo, useState } from "react";
import PageCard from "../common/PageCard";

function money(value) {
  return `LKR ${Number(value || 0).toFixed(2)}`;
}

function BuyerStorePage({ store, products, loading, error, onBack, onAddToCart, onViewProduct }) {
  const [busyProductId, setBusyProductId] = useState(null);

  const totalUnits = useMemo(
    () => (products || []).reduce((sum, product) => sum + Number(product.quantity || 0), 0),
    [products]
  );

  return (
    <div className="mx-auto max-w-6xl px-5 pb-14 pt-8">
      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-earth-200 bg-white/85 p-6 shadow-soft backdrop-blur-sm md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-earth-600">Farmer Store</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">{store?.name || "Store"}</h1>
          <p className="mt-2 text-slate-600">Browse products from this store and add items to your cart.</p>
        </div>
        <button
          type="button"
          className="rounded-xl border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 transition hover:bg-slate-50"
          onClick={onBack}
        >
          Back to Products
        </button>
      </div>

      <PageCard title="Store Details" subtitle="Contact and location information for this farm store.">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-earth-600">Store Name</p>
            <p className="text-base font-semibold text-slate-900">{store?.name || "Not available"}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-earth-600">Farmer</p>
            <p className="text-base font-semibold text-slate-900">{store?.farmer?.name || "Not available"}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-earth-600">Phone</p>
            <p className="text-base font-semibold text-slate-900">{store?.phone || "Not available"}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-earth-600">Location</p>
            <p className="text-base font-semibold text-slate-900">{store?.location || "Not available"}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-earth-600">Description</p>
            <p className="text-base text-slate-700">{store?.description || "No store description available."}</p>
          </div>
        </div>
      </PageCard>

      <PageCard
        title="Store Products"
        subtitle={`${products?.length || 0} product${(products?.length || 0) === 1 ? "" : "s"} • ${totalUnits} units available`}
      >
        {loading ? <p className="text-slate-600">Loading store products...</p> : null}
        {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}

        {!loading && !error && (products || []).length === 0 ? (
          <p className="text-slate-600">No products found for this store.</p>
        ) : null}

        {!loading && !error && (products || []).length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <article
                className="rounded-2xl border border-earth-200 bg-earth-50/50 p-4 flex flex-col transition hover:shadow-md hover:cursor-pointer"
                key={product._id}
                role="button"
                tabIndex={0}
                onClick={() => onViewProduct && onViewProduct(product._id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onViewProduct && onViewProduct(product._id);
                  }
                }}
              >
                {product.mainImage ? (
                  <div className="mb-3 overflow-hidden rounded-xl bg-gray-200 aspect-video">
                    <img
                      src={product.mainImage}
                      alt={product.name}
                      className="h-full w-full object-cover transition duration-300 hover:scale-105"
                    />
                  </div>
                ) : null}
                <div className="flex-1">
                  <strong className="text-base font-bold text-slate-900">{product.name}</strong>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-earth-600">{product.category}</p>
                  <p className="mt-1 text-sm text-slate-600 line-clamp-2">{product.description}</p>
                  <p className="mt-2 text-sm font-bold text-slate-900">{money(product.price)} per {product.unit}</p>
                  <p className="text-xs text-slate-500">{product.quantity} {product.unit} available</p>
                </div>
                <button
                  type="button"
                  className="mt-4 w-full rounded-xl border border-earth-300 bg-white px-3 py-2 text-sm font-semibold text-earth-700 transition hover:bg-earth-600 hover:text-white disabled:opacity-50"
                  onClick={async (event) => {
                    event.stopPropagation();
                    setBusyProductId(product._id);
                    try {
                      await onAddToCart(product._id);
                    } finally {
                      setBusyProductId(null);
                    }
                  }}
                  disabled={busyProductId === product._id}
                >
                  {busyProductId === product._id ? "Adding..." : "Add to cart"}
                </button>
              </article>
            ))}
          </div>
        ) : null}
      </PageCard>
    </div>
  );
}

export default BuyerStorePage;
