import { useMemo, useState } from "react";
import PageCard from "../common/PageCard";

function money(value) {
  return `LKR ${Number(value || 0).toFixed(2)}`;
}

function renderStars(value) {
  const rating = Math.max(0, Math.min(5, Number(value || 0)));
  return "★".repeat(Math.round(rating)) + "☆".repeat(5 - Math.round(rating));
}

function BuyerProductPage({ product, reviews, loading, error, onBack, onAddToCart }) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isAdding, setIsAdding] = useState(false);

  const images = useMemo(() => {
    const list = [];
    if (product?.mainImage) list.push(product.mainImage);
    if (Array.isArray(product?.extraImages)) {
      list.push(...product.extraImages.filter(Boolean));
    }
    return list;
  }, [product]);

  const averageRating = useMemo(() => {
    if (!reviews?.length) return 0;
    const total = reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0);
    return total / reviews.length;
  }, [reviews]);

  return (
    <div className="mx-auto max-w-6xl px-5 pb-14 pt-8">
      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-earth-200 bg-white/85 p-6 shadow-soft backdrop-blur-sm md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-earth-600">Product Details</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">{product?.name || "Product"}</h1>
          <p className="mt-2 text-slate-600">View product images and customer reviews.</p>
        </div>
        <button
          type="button"
          className="rounded-xl border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 transition hover:bg-slate-50"
          onClick={onBack}
        >
          Back
        </button>
      </div>

      {loading ? <p className="mb-4 text-slate-600">Loading product details...</p> : null}
      {error ? <p className="mb-4 text-sm font-medium text-red-700">{error}</p> : null}

      {!loading && !error && product ? (
        <>
          <PageCard title={product.name} subtitle={`${product.category || "Category"} • ${money(product.price)} per ${product.unit || "unit"}`}>
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <div className="overflow-hidden rounded-2xl border border-earth-200 bg-slate-50">
                  {images.length > 0 ? (
                    <img
                      src={images[selectedImage]}
                      alt={product.name}
                      className="h-[360px] w-full object-contain"
                    />
                  ) : (
                    <div className="flex h-[360px] items-center justify-center text-sm font-semibold text-slate-400">
                      No image available
                    </div>
                  )}
                </div>

                {images.length > 1 ? (
                  <div className="mt-3 grid grid-cols-4 gap-2">
                    {images.map((image, index) => (
                      <button
                        key={`${image}-${index}`}
                        type="button"
                        onClick={() => setSelectedImage(index)}
                        className={`overflow-hidden rounded-lg border ${selectedImage === index ? "border-earth-600" : "border-slate-200"}`}
                      >
                        <img src={image} alt={`${product.name} ${index + 1}`} className="h-16 w-full object-cover" />
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="space-y-4">
                <p className="text-sm leading-6 text-slate-700">{product.description || "No description available."}</p>
                <p className="text-sm text-slate-600">Available: {product.quantity} {product.unit}</p>
                <p className="text-sm text-slate-600">Store: {product.store?.name || "Unknown Store"}</p>

                <button
                  type="button"
                  className="w-full rounded-xl border border-earth-300 bg-white px-4 py-2.5 text-sm font-semibold text-earth-700 transition hover:bg-earth-600 hover:text-white disabled:opacity-50"
                  onClick={async () => {
                    setIsAdding(true);
                    try {
                      await onAddToCart(product._id);
                    } finally {
                      setIsAdding(false);
                    }
                  }}
                  disabled={isAdding}
                >
                  {isAdding ? "Adding..." : "Add to cart"}
                </button>
              </div>
            </div>
          </PageCard>

          <PageCard
            title="Product Reviews"
            subtitle={reviews?.length ? `${reviews.length} review${reviews.length === 1 ? "" : "s"} • ${averageRating.toFixed(1)} average` : "No reviews yet"}
          >
            {reviews?.length ? (
              <div className="space-y-3">
                {reviews.map((review) => (
                  <div key={review._id} className="rounded-xl border border-earth-200 bg-earth-50/50 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold text-slate-900">{review.buyerId?.name || "Buyer"}</p>
                      <p className="text-sm font-semibold text-amber-600">{renderStars(review.rating)} ({review.rating}/5)</p>
                    </div>
                    <p className="mt-2 text-sm text-slate-700">{review.comment || "No written comment"}</p>
                    <p className="mt-2 text-xs text-slate-500">{review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ""}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-600">No reviews available for this product yet.</p>
            )}
          </PageCard>
        </>
      ) : null}
    </div>
  );
}

export default BuyerProductPage;
