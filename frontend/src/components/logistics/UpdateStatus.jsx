import { useState } from "react";

const STATUS_OPTIONS = [
  { value: "Scheduled", label: "Scheduled", color: "bg-amber-100 text-amber-700", icon: "📅" },
  { value: "Picked Up", label: "Picked Up", color: "bg-blue-100 text-blue-700", icon: "📦" },
  { value: "In Transit", label: "In Transit", color: "bg-purple-100 text-purple-700", icon: "🚛" },
  { value: "Out for Delivery", label: "Out for Delivery", color: "bg-orange-100 text-orange-700", icon: "🚚" },
  { value: "Delivered", label: "Delivered", color: "bg-emerald-100 text-emerald-700", icon: "✅" },
  { value: "Cancelled", label: "Cancelled", color: "bg-red-100 text-red-700", icon: "❌" },
];

function UpdateStatus({ logistics, isOpen, onClose, onSubmit }) {
  const [selectedStatus, setSelectedStatus] = useState(logistics?.status || "Scheduled");
  const [notifyCustomer, setNotifyCustomer] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  if (!isOpen || !logistics) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (notifyCustomer) {
      setShowConfirmation(true);
    } else {
      await performUpdate();
    }
  };

  const performUpdate = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit(logistics._id, selectedStatus, notifyCustomer);
      onClose();
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setIsSubmitting(false);
      setShowConfirmation(false);
    }
  };

  const currentStatusLabel = STATUS_OPTIONS.find(s => s.value === logistics.status)?.label || logistics.status;
  const newStatusLabel = STATUS_OPTIONS.find(s => s.value === selectedStatus)?.label || selectedStatus;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 py-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        {!showConfirmation ? (
          <>
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-earth-600">Update Status</p>
              <h3 className="mt-1 text-2xl font-bold text-slate-900">Update Delivery Status</h3>
              <p className="text-sm text-slate-600">
                Order: <span className="font-mono font-semibold">{logistics.orderId?._id || logistics.orderId || "N/A"}</span>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Current Status */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Current Status</p>
                <p className="font-semibold text-slate-900">{currentStatusLabel}</p>
              </div>

              {/* Status Dropdown */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">New Status</label>
                <div className="space-y-2">
                  {STATUS_OPTIONS.map((status) => (
                    <label
                      key={status.value}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${
                        selectedStatus === status.value
                          ? "border-earth-500 bg-earth-50 ring-1 ring-earth-500"
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="status"
                        value={status.value}
                        checked={selectedStatus === status.value}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="h-4 w-4 text-earth-600 focus:ring-earth-500"
                      />
                      <span className="text-lg">{status.icon}</span>
                      <div className="flex-1">
                        <span className="block font-semibold text-slate-900">{status.label}</span>
                      </div>
                      {selectedStatus === status.value && (
                        <svg className="h-5 w-5 text-earth-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {/* Notification Toggle */}
              <div className="rounded-xl border border-earth-200 bg-earth-50/50 p-4">
                <label className="flex cursor-pointer items-center gap-3">
                  <div className="relative inline-flex h-6 w-11 items-center">
                    <input
                      type="checkbox"
                      checked={notifyCustomer}
                      onChange={(e) => setNotifyCustomer(e.target.checked)}
                      className="peer sr-only"
                    />
                    <span className="h-6 w-11 rounded-full bg-slate-200 transition peer-checked:bg-earth-600 peer-focus:ring-2 peer-focus:ring-earth-300"></span>
                    <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform peer-checked:translate-x-5"></span>
                  </div>
                  <div className="flex-1">
                    <span className="block text-sm font-semibold text-slate-900">Notify Customer via WhatsApp</span>
                    <span className="text-xs text-slate-500">Send status update to customer</span>
                  </div>
                </label>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || selectedStatus === logistics.status}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-earth-600 px-4 py-2.5 font-semibold text-white transition hover:bg-earth-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating...
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Update Status
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </>
        ) : (
          /* WhatsApp Confirmation Modal */
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                <svg className="h-8 w-8 text-emerald-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.35-8.413" />
                </svg>
              </div>
            </div>
            <h3 className="mb-2 text-xl font-bold text-slate-900">Confirm Notification</h3>
            <p className="mb-6 text-sm text-slate-600">
              Customer will be notified via <strong className="text-emerald-600">WhatsApp</strong> about the status change:
            </p>
            <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-center gap-4">
                <div className="text-center">
                  <p className="text-xs text-slate-500">From</p>
                  <p className="font-semibold text-slate-900">{currentStatusLabel}</p>
                </div>
                <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
                <div className="text-center">
                  <p className="text-xs text-slate-500">To</p>
                  <p className="font-semibold text-earth-700">{newStatusLabel}</p>
                </div>
              </div>
            </div>
            <p className="mb-6 text-xs text-slate-500">
              Phone: {logistics.customerPhone || logistics.recipientPhone || "N/A"}
            </p>
            <div className="flex gap-3">
              <button
                onClick={performUpdate}
                disabled={isSubmitting}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Confirm & Notify
                  </>
                )}
              </button>
              <button
                onClick={() => setShowConfirmation(false)}
                disabled={isSubmitting}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Go Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UpdateStatus;
