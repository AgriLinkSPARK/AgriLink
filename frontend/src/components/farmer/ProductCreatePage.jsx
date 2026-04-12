import { useEffect, useRef, useState } from "react";
import PageCard from "../common/PageCard";

function ProductCreatePage({
  loading,
  error,
  onSubmit,
  onBack,
  initialProduct = null,
  mode = "create",
}) {
  const mainImageInputRef = useRef(null);
  const extraImagesInputRef = useRef(null);
  const [form, setForm] = useState({
    name: initialProduct?.name || "",
    category: initialProduct?.category || "",
    description: initialProduct?.description || "",
    price: initialProduct?.price ?? "",
    quantity: initialProduct?.quantity ?? "",
    unit: "kg",
    harvestDate: initialProduct?.harvestDate ? String(initialProduct.harvestDate).slice(0, 10) : "",
    mainImage: null,
    extraImages: [],
  });
  const [mainPreviewUrl, setMainPreviewUrl] = useState("");
  const [extraPreviewUrls, setExtraPreviewUrls] = useState([]);

  function removeMainImage(event) {
    event.stopPropagation();
    setForm((current) => ({ ...current, mainImage: null }));
  }

  function removeExtraImage(indexToRemove, event) {
    event.stopPropagation();
    setForm((current) => ({
      ...current,
      extraImages: current.extraImages.filter((_, index) => index !== indexToRemove),
    }));
  }

  useEffect(() => {
    setForm({
      name: initialProduct?.name || "",
      category: initialProduct?.category || "",
      description: initialProduct?.description || "",
      price: initialProduct?.price ?? "",
      quantity: initialProduct?.quantity ?? "",
      unit: initialProduct?.unit || "kg",
      harvestDate: initialProduct?.harvestDate ? String(initialProduct.harvestDate).slice(0, 10) : "",
      mainImage: null,
      extraImages: [],
    });
  }, [initialProduct]);

  useEffect(() => {
    if (!form.mainImage) {
      setMainPreviewUrl(initialProduct?.mainImage || "");
      return;
    }

    const url = URL.createObjectURL(form.mainImage);
    setMainPreviewUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [form.mainImage, initialProduct?.mainImage]);

  useEffect(() => {
    if (!form.extraImages.length) {
      setExtraPreviewUrls(Array.isArray(initialProduct?.extraImages) ? initialProduct.extraImages : []);
      return;
    }

    const urls = form.extraImages.map((file) => URL.createObjectURL(file));
    setExtraPreviewUrls(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [form.extraImages, initialProduct?.extraImages]);

  return (
    <div className="mx-auto max-w-6xl px-5 pb-14 pt-8">
      <PageCard
        title={mode === "edit" ? "Update Product" : "Add Product"}
        subtitle={mode === "edit" ? "Edit this product for your farm store." : "Create a new product for your farm store."}
        actions={
          onBack ? (
            <button
              type="button"
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              onClick={onBack}
            >
              Back to products
            </button>
          ) : null
        }
      >
        {loading ? <p className="mb-3 text-slate-600">Saving product...</p> : null}
        {error ? <p className="mb-3 text-sm font-medium text-red-700">{error}</p> : null}

        <form
          className="grid max-w-2xl gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            if (onSubmit) {
              onSubmit(form);
            }
          }}
        >
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-slate-700">Product Name</span>
            <input
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-earth-500 focus:ring-2 focus:ring-earth-200"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="Fresh Tomatoes"
              required
            />
          </label>

          <label className="grid gap-1">
            <span className="text-sm font-semibold text-slate-700">Category</span>
            <input
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-earth-500 focus:ring-2 focus:ring-earth-200"
              value={form.category}
              onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
              placeholder="Vegetables"
              required
            />
          </label>

          <label className="grid gap-1">
            <span className="text-sm font-semibold text-slate-700">Description</span>
            <textarea
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-earth-500 focus:ring-2 focus:ring-earth-200"
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              placeholder="Describe your product"
              rows={3}
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1">
              <span className="text-sm font-semibold text-slate-700">Price</span>
              <input
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-earth-500 focus:ring-2 focus:ring-earth-200"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
                placeholder="50"
                required
              />
            </label>

            <label className="grid gap-1">
              <span className="text-sm font-semibold text-slate-700">Quantity</span>
              <input
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-earth-500 focus:ring-2 focus:ring-earth-200"
                type="number"
                min="0"
                step="1"
                value={form.quantity}
                onChange={(event) => setForm((current) => ({ ...current, quantity: event.target.value }))}
                placeholder="100"
                required
              />
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1">
              <span className="text-sm font-semibold text-slate-700">Unit</span>
              <input
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-earth-500 focus:ring-2 focus:ring-earth-200"
                value={form.unit}
                onChange={(event) => setForm((current) => ({ ...current, unit: event.target.value }))}
                placeholder="kg"
              />
            </label>

            <label className="grid gap-1">
              <span className="text-sm font-semibold text-slate-700">Harvest Date</span>
              <input
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-earth-500 focus:ring-2 focus:ring-earth-200"
                type="date"
                value={form.harvestDate}
                onChange={(event) => setForm((current) => ({ ...current, harvestDate: event.target.value }))}
              />
            </label>
          </div>

          <div className="grid gap-2">
            <p className="text-sm font-semibold text-slate-700">
              Upload Main Image* <span className="font-normal italic text-slate-500">(Supported formats: JPG, PNG. Recommended size: 1500x1500)</span>
            </p>
            <input
              ref={mainImageInputRef}
              className="hidden"
              type="file"
              accept="image/*"
              onChange={(event) => setForm((current) => ({ ...current, mainImage: event.target.files?.[0] || null }))}
              required={mode === "create"}
            />
            <button
              type="button"
              className="group rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-3 text-left transition hover:border-earth-500 hover:bg-earth-50"
              onClick={() => mainImageInputRef.current?.click()}
            >
              <div className="relative flex min-h-[160px] items-center justify-center overflow-hidden rounded-xl border border-dashed border-slate-300 bg-white">
                {mainPreviewUrl ? (
                  <>
                    <img src={mainPreviewUrl} alt="Main product preview" className="h-[160px] w-full object-cover" />
                    <button
                      type="button"
                      className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-xl leading-none text-white shadow-sm transition hover:bg-red-600"
                      onClick={removeMainImage}
                      aria-label="Remove main image"
                    >
                      x
                    </button>
                  </>
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-200 text-4xl leading-none text-slate-700">+</div>
                )}
              </div>
            </button>
            <p className="text-xs text-slate-500">
              {form.mainImage
                ? `Selected: ${form.mainImage.name}`
                : initialProduct?.mainImage
                  ? "Current image is shown above. Click to replace it."
                  : "Click the area above to choose a main image."}
            </p>
          </div>

          <div className="grid gap-2">
            <p className="text-sm font-semibold text-slate-700">Upload Extra Images (Multiple)</p>
            <input
              ref={extraImagesInputRef}
              className="hidden"
              type="file"
              accept="image/*"
              multiple
              onChange={(event) => {
                const pickedFiles = Array.from(event.target.files || []);
                setForm((current) => ({
                  ...current,
                  extraImages: [...current.extraImages, ...pickedFiles],
                }));

                // Reset so selecting the same file again still triggers onChange
                event.target.value = "";
              }}
            />
            <button
              type="button"
              className="group rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-3 text-left transition hover:border-earth-500 hover:bg-earth-50"
              onClick={() => extraImagesInputRef.current?.click()}
            >
              {extraPreviewUrls.length > 0 ? (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {extraPreviewUrls.map((url, index) => (
                    <div key={`${url}-${index}`} className="relative">
                      <img src={url} alt={`Extra preview ${index + 1}`} className="h-24 w-full rounded-lg object-cover" />
                      <button
                        type="button"
                        className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-sm leading-none text-white shadow-sm transition hover:bg-red-600"
                        onClick={(event) => removeExtraImage(index, event)}
                        aria-label={`Remove extra image ${index + 1}`}
                      >
                        x
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex min-h-[140px] items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-200 text-4xl leading-none text-slate-700">+</div>
                </div>
              )}
            </button>
            <p className="text-xs text-slate-500">
              {form.extraImages.length > 0
                ? `${form.extraImages.length} image(s) selected`
                : Array.isArray(initialProduct?.extraImages) && initialProduct.extraImages.length > 0
                  ? `${initialProduct.extraImages.length} existing image(s) shown above. Click to replace them.`
                  : "You can select multiple extra images."}
            </p>
          </div>

          <button className="rounded-xl bg-earth-600 px-4 py-2.5 font-semibold text-white transition hover:bg-earth-700" type="submit" disabled={loading}>
            {loading ? "Saving..." : mode === "edit" ? "Update product" : "Add product"}
          </button>
        </form>
      </PageCard>
    </div>
  );
}

export default ProductCreatePage;
