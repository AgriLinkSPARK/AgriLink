import { useMemo } from "react";

const STATUS_STEPS = [
  { key: "Scheduled", label: "Scheduled", icon: "📅", description: "Order received, awaiting pickup" },
  { key: "Picked Up", label: "Picked Up", icon: "📦", description: "Items picked up from farmer" },
  { key: "In Transit", label: "In Transit", icon: "🚛", description: "Package is on the way" },
  { key: "Out for Delivery", label: "Out for Delivery", icon: "🚚", description: "Arriving today" },
  { key: "Delivered", label: "Delivered", icon: "✅", description: "Successfully delivered" },
];

const STATUS_COLORS = {
  "Scheduled": "bg-amber-100 text-amber-700 border-amber-200",
  "Picked Up": "bg-blue-100 text-blue-700 border-blue-200",
  "In Transit": "bg-purple-100 text-purple-700 border-purple-200",
  "Out for Delivery": "bg-orange-100 text-orange-700 border-orange-200",
  "Delivered": "bg-emerald-100 text-emerald-700 border-emerald-200",
  "Cancelled": "bg-red-100 text-red-700 border-red-200",
};

function LogisticsDetails({ logistics, isOpen, onClose, onUpdateStatus, onSendNotification }) {
  const currentStepIndex = useMemo(() => {
    const index = STATUS_STEPS.findIndex(step => step.key === logistics?.status);
    return index === -1 ? 0 : index;
  }, [logistics?.status]);

  const notificationHistory = logistics?.notifications || [];

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!isOpen || !logistics) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 py-6">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-earth-600">Logistics Details</p>
              <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLORS[logistics.status] || STATUS_COLORS.pending}`}>
                {(logistics.status || "pending").replace(/_/g, " ").toUpperCase()}
              </span>
            </div>
            <h3 className="mt-1 text-2xl font-bold text-slate-900">
              Order: {logistics.orderId?._id || logistics.orderId || "N/A"}
            </h3>
            <p className="text-sm text-slate-600">Created: {formatDate(logistics.createdAt)}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onUpdateStatus(logistics)}
              className="rounded-lg border border-earth-300 bg-white px-3 py-1.5 text-sm font-semibold text-earth-700 transition hover:bg-earth-50"
            >
              Update Status
            </button>
            <button
              onClick={onClose}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Close
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Basic Info & Status */}
          <div className="space-y-6 lg:col-span-2">
            {/* Status Tracker */}
            <section className="rounded-2xl border border-earth-200 bg-earth-50/30 p-5">
              <h4 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
                <svg className="h-5 w-5 text-earth-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                Status Tracker
              </h4>
              <div className="relative">
                {/* Progress Line */}
                <div className="absolute left-4 top-0 h-full w-0.5 bg-slate-200">
                  <div
                    className="w-full bg-earth-500 transition-all duration-500"
                    style={{ height: `${(currentStepIndex / (STATUS_STEPS.length - 1)) * 100}%` }}
                  />
                </div>

                {/* Steps */}
                <div className="space-y-4">
                  {STATUS_STEPS.map((step, index) => {
                    const isCompleted = index <= currentStepIndex;
                    const isCurrent = index === currentStepIndex;

                    return (
                      <div key={step.key} className="relative flex items-start gap-4">
                        <div
                          className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm ${
                            isCompleted
                              ? "border-earth-500 bg-earth-500 text-white"
                              : "border-slate-300 bg-white text-slate-400"
                          } ${isCurrent ? "ring-4 ring-earth-200" : ""}`}
                        >
                          {isCompleted ? (
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                          ) : (
                            index + 1
                          )}
                        </div>
                        <div className={`flex-1 rounded-xl border p-3 ${isCurrent ? "border-earth-300 bg-white shadow-sm" : "border-transparent bg-white/50"}`}>
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{step.icon}</span>
                            <span className={`font-semibold ${isCompleted || isCurrent ? "text-slate-900" : "text-slate-500"}`}>
                              {step.label}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-slate-500">{step.description}</p>
                          {isCurrent && logistics.statusUpdatedAt && (
                            <p className="mt-1 text-xs text-earth-600">
                              Updated: {formatDate(logistics.statusUpdatedAt)}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* Map Section */}
            {logistics.deliveryLocation && (
              <section className="rounded-2xl border border-earth-200 bg-earth-50/30 p-5">
                <h4 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
                  <svg className="h-5 w-5 text-earth-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Delivery Location
                </h4>
                <div className="overflow-hidden rounded-xl border border-earth-200">
                  <div className="h-64 bg-slate-100">
                    <iframe
                      title="Delivery Location Map"
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      style={{ border: 0 }}
                      src={`https://www.google.com/maps?q=${encodeURIComponent(logistics.deliveryLocation)}&output=embed`}
                      allowFullScreen
                    />
                  </div>
                  <div className="border-t border-earth-200 bg-white p-3">
                    <p className="flex items-center gap-2 text-sm text-slate-700">
                      <svg className="h-4 w-4 text-earth-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {logistics.deliveryLocation}
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* Notes Section */}
            {logistics.notes && (
              <section className="rounded-2xl border border-earth-200 bg-earth-50/30 p-5">
                <h4 className="mb-2 flex items-center gap-2 text-lg font-bold text-slate-900">
                  <svg className="h-5 w-5 text-earth-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Delivery Notes
                </h4>
                <p className="rounded-xl bg-white p-3 text-sm text-slate-700">{logistics.notes}</p>
              </section>
            )}
          </div>

          {/* Right Column - Info & Notifications */}
          <div className="space-y-6">
            {/* Basic Info Card */}
            <section className="rounded-2xl border border-earth-200 bg-white p-5 shadow-sm">
              <h4 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Customer Info
              </h4>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-slate-500">Customer Name</p>
                  <p className="font-semibold text-slate-900">{logistics.customerName || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Customer Phone</p>
                  <p className="font-mono text-sm text-slate-700">{logistics.customerPhone || "N/A"}</p>
                </div>
                {logistics.recipientPhone && logistics.recipientPhone !== logistics.customerPhone && (
                  <div>
                    <p className="text-xs text-slate-500">Recipient Phone</p>
                    <p className="font-mono text-sm text-slate-700">{logistics.recipientPhone}</p>
                  </div>
                )}
              </div>
            </section>

            {/* Delivery Info */}
            <section className="rounded-2xl border border-earth-200 bg-white p-5 shadow-sm">
              <h4 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 012-2h7a2 2 0 012 2v2H7v-2z" />
                </svg>
                Delivery Info
              </h4>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-slate-500">Delivery Partner</p>
                  <p className="font-semibold text-slate-900">{logistics.deliveryPartner || "Not assigned"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Pickup Location</p>
                  <p className="text-sm text-slate-700">{logistics.pickupLocation || "Not specified"}</p>
                </div>
              </div>
            </section>

            {/* Notifications Log */}
            <section className="rounded-2xl border border-earth-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  Notifications
                </h4>
                {onSendNotification && (
                  <button
                    onClick={() => onSendNotification(logistics)}
                    className="rounded-lg border border-earth-300 bg-white px-2 py-1 text-xs font-semibold text-earth-700 transition hover:bg-earth-50"
                  >
                    Send Update
                  </button>
                )}
              </div>

              {notificationHistory.length === 0 ? (
                <div className="rounded-xl bg-slate-50 p-4 text-center">
                  <svg className="mx-auto mb-2 h-8 w-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  <p className="text-xs text-slate-500">No notifications sent yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notificationHistory.map((notification, index) => (
                    <div key={index} className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-slate-900">{notification.message || "Status update sent"}</p>
                        <p className="text-xs text-slate-500">{formatDate(notification.sentAt)}</p>
                        {notification.channel && (
                          <span className="mt-1 inline-flex items-center gap-1 text-xs text-slate-600">
                            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.35-8.413" />
                            </svg>
                            {notification.channel}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LogisticsDetails;
