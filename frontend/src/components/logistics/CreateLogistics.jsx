import { useState, useEffect } from "react";

function CreateLogistics({ isOpen, onClose, onSubmit, orders = [], prefillOrder = null }) {
  const [formData, setFormData] = useState({
    orderId: "",
    customerName: "",
    customerPhone: "",
    recipientPhone: "",
    deliveryLocation: "",
    pickupLocation: "",
    deliveryPartner: "",
    notes: "",
    latitude: "",
    longitude: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMapPreview, setShowMapPreview] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      if (prefillOrder) {
        setFormData({
          orderId: prefillOrder._id || "",
          customerName: prefillOrder.customer?.name || "",
          customerPhone: prefillOrder.customer?.phone || "",
          recipientPhone: prefillOrder.customer?.phone || "",
          deliveryLocation: prefillOrder.shippingAddress || "",
          pickupLocation: "",
          deliveryPartner: "",
          notes: "",
          latitude: "",
          longitude: "",
        });
      } else {
        setFormData({
          orderId: "",
          customerName: "",
          customerPhone: "",
          recipientPhone: "",
          deliveryLocation: "",
          pickupLocation: "",
          deliveryPartner: "",
          notes: "",
          latitude: "",
          longitude: "",
        });
      }
      setErrors({});
      setShowMapPreview(false);
    }
  }, [isOpen, prefillOrder]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.orderId) newErrors.orderId = "Order ID is required";
    if (!formData.deliveryLocation) newErrors.deliveryLocation = "Delivery location is required";
    if (!formData.customerPhone) newErrors.customerPhone = "Customer phone is required";
    if (!formData.deliveryPartner) newErrors.deliveryPartner = "Delivery partner is required";
    if (!formData.pickupLocation) newErrors.pickupLocation = "Pickup location is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error("Failed to create logistics:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLocationChange = (value) => {
    setFormData(prev => ({ ...prev, deliveryLocation: value }));
    setShowMapPreview(value.length > 5);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 py-6">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-earth-600">Create Delivery</p>
            <h3 className="mt-1 text-2xl font-bold text-slate-900">New Logistics Record</h3>
            <p className="text-sm text-slate-600">Create a new delivery record for a confirmed order.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Order Selection */}
          <div className="rounded-xl border border-earth-200 bg-earth-50/50 p-4">
            <label className="mb-2 block text-sm font-semibold text-slate-800">
              Order ID <span className="text-red-500">*</span>
            </label>
            {orders.length > 0 ? (
              <select
                value={formData.orderId}
                onChange={(e) => {
                  const selectedOrder = orders.find(o => o._id === e.target.value);
                  setFormData(prev => ({
                    ...prev,
                    orderId: e.target.value,
                    customerName: selectedOrder?.customer?.name || "",
                    customerPhone: selectedOrder?.customer?.phone || "",
                    recipientPhone: selectedOrder?.customer?.phone || "",
                    deliveryLocation: selectedOrder?.shippingAddress || "",
                  }));
                  setShowMapPreview((selectedOrder?.shippingAddress || "").length > 5);
                }}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-earth-500 focus:ring-2 focus:ring-earth-200"
              >
                <option value="">Select an order...</option>
                {orders.map(order => (
                  <option key={order._id} value={order._id}>
                    {order._id} - {order.customer?.name || "Unknown"}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={formData.orderId}
                onChange={(e) => setFormData(prev => ({ ...prev, orderId: e.target.value }))}
                placeholder="Enter Order ID"
                className={`w-full rounded-xl border px-3 py-2.5 outline-none transition focus:ring-2 ${errors.orderId ? "border-red-300 focus:border-red-500 focus:ring-red-200" : "border-slate-300 focus:border-earth-500 focus:ring-earth-200"}`}
              />
            )}
            {errors.orderId && <p className="mt-1 text-xs text-red-600">{errors.orderId}</p>}
          </div>

          {/* Customer Information */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Customer Name</label>
              <input
                type="text"
                value={formData.customerName}
                onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                placeholder="Customer name"
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-earth-500 focus:ring-2 focus:ring-earth-200"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">
                Customer Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.customerPhone}
                onChange={(e) => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                placeholder="+94 XX XXX XXXX"
                className={`w-full rounded-xl border px-3 py-2.5 outline-none transition focus:ring-2 ${errors.customerPhone ? "border-red-300 focus:border-red-500 focus:ring-red-200" : "border-slate-300 focus:border-earth-500 focus:ring-earth-200"}`}
              />
              {errors.customerPhone && <p className="mt-1 text-xs text-red-600">{errors.customerPhone}</p>}
            </div>
          </div>

          {/* Phone Numbers */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Recipient Phone</label>
              <input
                type="tel"
                value={formData.recipientPhone}
                onChange={(e) => setFormData(prev => ({ ...prev, recipientPhone: e.target.value }))}
                placeholder="If different from customer"
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-earth-500 focus:ring-2 focus:ring-earth-200"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">
                Delivery Partner <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.deliveryPartner}
                onChange={(e) => setFormData(prev => ({ ...prev, deliveryPartner: e.target.value }))}
                placeholder="e.g., Fast Delivery Co."
                className={`w-full rounded-xl border px-3 py-2.5 outline-none transition focus:ring-2 ${errors.deliveryPartner ? "border-red-300 focus:border-red-500 focus:ring-red-200" : "border-slate-300 focus:border-earth-500 focus:ring-earth-200"}`}
              />
              {errors.deliveryPartner && <p className="mt-1 text-xs text-red-600">{errors.deliveryPartner}</p>}
            </div>
          </div>

          {/* Location Section */}
          <div className="rounded-xl border border-earth-200 bg-earth-50/30 p-4">
            <label className="mb-2 block text-sm font-semibold text-slate-800">
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 text-earth-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Delivery Location <span className="text-red-500">*</span>
              </span>
            </label>
            <input
              type="text"
              value={formData.deliveryLocation}
              onChange={(e) => handleLocationChange(e.target.value)}
              placeholder="Enter full address or location name..."
              className={`w-full rounded-xl border px-3 py-2.5 outline-none transition focus:ring-2 ${errors.deliveryLocation ? "border-red-300 focus:border-red-500 focus:ring-red-200" : "border-slate-300 focus:border-earth-500 focus:ring-earth-200"}`}
            />
            {errors.deliveryLocation && <p className="mt-1 text-xs text-red-600">{errors.deliveryLocation}</p>}

            {/* Map Preview */}
            {showMapPreview && formData.deliveryLocation && (
              <div className="mt-3 overflow-hidden rounded-xl border border-earth-200">
                <div className="bg-earth-100 px-3 py-2 text-xs font-semibold text-earth-800">
                  Map Preview
                </div>
                <div className="h-48 bg-slate-100">
                  <iframe
                    title="Delivery Location"
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    style={{ border: 0 }}
                    src={`https://www.google.com/maps?q=${encodeURIComponent(formData.deliveryLocation)}&output=embed`}
                    allowFullScreen
                  />
                </div>
              </div>
            )}
          </div>

          {/* Pickup Location */}
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">
              Pickup Location <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.pickupLocation}
              onChange={(e) => setFormData(prev => ({ ...prev, pickupLocation: e.target.value }))}
              placeholder="Where to pick up the order"
              className={`w-full rounded-xl border px-3 py-2.5 outline-none transition focus:ring-2 ${errors.pickupLocation ? "border-red-300 focus:border-red-500 focus:ring-red-200" : "border-slate-300 focus:border-earth-500 focus:ring-earth-200"}`}
            />
            {errors.pickupLocation && <p className="mt-1 text-xs text-red-600">{errors.pickupLocation}</p>}
          </div>

          {/* Notes */}
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Delivery Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Any special instructions for delivery..."
              rows={3}
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-earth-500 focus:ring-2 focus:ring-earth-200"
            />
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-xl bg-earth-600 px-6 py-2.5 font-semibold text-white transition hover:bg-earth-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Create Logistics
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateLogistics;
