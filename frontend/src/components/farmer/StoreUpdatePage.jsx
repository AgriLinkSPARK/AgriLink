import { useEffect, useState } from "react";
import PageCard from "../common/PageCard";

function StoreUpdatePage({ initialStore, loading, error, onSubmit, onBack, isSetupMode = false }) {
  const [storeForm, setStoreForm] = useState({
    name: initialStore?.name || "",
    description: initialStore?.description || "",
    location: initialStore?.location || "",
    phone: initialStore?.phone || "",
  });

  useEffect(() => {
    setStoreForm({
      name: initialStore?.name || "",
      description: initialStore?.description || "",
      location: initialStore?.location || "",
      phone: initialStore?.phone || "",
    });
  }, [initialStore?.name, initialStore?.description, initialStore?.location, initialStore?.phone]);

  return (
    <div className="mx-auto max-w-6xl px-5 pb-14 pt-8">
      <PageCard
        title={isSetupMode ? "Set Up Your Farm Store" : "Update Store Information"}
        subtitle={isSetupMode ? "Complete this form to unlock your dashboard." : "Edit your store details and save changes."}
        actions={
          onBack ? (
            <button
              type="button"
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              onClick={onBack}
            >
              Back to dashboard
            </button>
          ) : null
        }
      >
        {loading ? <p className="mb-3 text-slate-600">Saving store information...</p> : null}
        {error ? <p className="mb-3 text-sm font-medium text-red-700">{error}</p> : null}

        <form
          className="grid max-w-lg gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            if (onSubmit) {
              onSubmit(storeForm);
            }
          }}
        >
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-slate-700">Store Name</span>
            <input
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-earth-500 focus:ring-2 focus:ring-earth-200"
              value={storeForm.name}
              onChange={(event) => setStoreForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="My Farm Store"
              required
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-slate-700">Description</span>
            <textarea
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-earth-500 focus:ring-2 focus:ring-earth-200"
              value={storeForm.description}
              onChange={(event) => setStoreForm((current) => ({ ...current, description: event.target.value }))}
              placeholder="Tell buyers about your farm..."
              rows={3}
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-slate-700">Location</span>
            <input
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-earth-500 focus:ring-2 focus:ring-earth-200"
              value={storeForm.location}
              onChange={(event) => setStoreForm((current) => ({ ...current, location: event.target.value }))}
              placeholder="Farm location"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-semibold text-slate-700">Phone</span>
            <input
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-earth-500 focus:ring-2 focus:ring-earth-200"
              value={storeForm.phone}
              onChange={(event) => setStoreForm((current) => ({ ...current, phone: event.target.value }))}
              placeholder="+94 71 xxx xxxx"
            />
          </label>
          <button className="rounded-xl bg-earth-600 px-4 py-2.5 font-semibold text-white transition hover:bg-earth-700" type="submit" disabled={loading}>
            {loading ? "Saving..." : isSetupMode ? "Complete setup" : "Save store info"}
          </button>
        </form>
      </PageCard>
    </div>
  );
}

export default StoreUpdatePage;
