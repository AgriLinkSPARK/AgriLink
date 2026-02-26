// backend/controllers/paymentController.js
import Order from "../models/order.js";

// Simulate payment
export const payOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, buyerId: req.user.id });
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Simulate successful payment
    order.paymentStatus = "Paid";
    order.status = "Confirmed";
    await order.save();

    res.json({
      message: "Payment successful (simulated)",
      order
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};