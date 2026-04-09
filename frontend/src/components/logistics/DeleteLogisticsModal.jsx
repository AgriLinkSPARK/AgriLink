import { useState } from "react";

function DeleteLogisticsModal({ logistics, isOpen, onClose, onConfirm }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  if (!isOpen || !logistics) return null;

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm(logistics._id);
      onClose();
    } catch (error) {
      console.error("Failed to delete logistics:", error);
    } finally {
      setIsDeleting(false);
      setConfirmText("");
    }
  };

  const isConfirmed = confirmText.toLowerCase() === "delete";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 py-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <h3 className="mb-2 text-xl font-bold text-slate-900">Delete Logistics Record?</h3>
          <p className="text-sm text-slate-600">
            Are you sure you want to delete this delivery record? This action cannot be undone.
          </p>
        </div>

        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Order ID:</span>
              <span className="font-mono font-semibold text-slate-900">{logistics.orderId?._id || logistics.orderId || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Customer:</span>
              <span className="font-semibold text-slate-900">{logistics.customerName || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Status:</span>
              <span className="font-semibold text-slate-900 capitalize">{(logistics.status || "pending").replace(/_/g, " ")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Created:</span>
              <span className="font-semibold text-slate-900">
                {logistics.createdAt ? new Date(logistics.createdAt).toLocaleDateString() : "N/A"}
              </span>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Type <span className="text-red-600">"delete"</span> to confirm:
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="Type 'delete' here..."
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-center outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-200"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleConfirm}
            disabled={!isConfirmed || isDeleting}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Deleting...
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Yes, Delete
              </>
            )}
          </button>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-xl border border-slate-300 bg-white px-6 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteLogisticsModal;
