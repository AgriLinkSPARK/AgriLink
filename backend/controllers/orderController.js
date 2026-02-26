import Order from "../models/order.js";
import Cart from "../models/Cart.js";
import User from "../models/User.js";
import { 
  sendOrderConfirmationEmail, 
  sendOrderCancellationEmail, 
  sendPaymentConfirmationEmail 
} from "../utils/mailer.js";

// Checkout → create order from cart
export const checkout = async (req, res) => {
  try {
    const cart = await Cart.findOne({ buyerId: req.user.id });
    if (!cart || cart.items.length === 0) return res.status(400).json({ message: "Cart is empty" });

    // Simulated total price
    const totalPrice = cart.items.reduce((sum, item) => sum + item.quantity * 10, 0);

    const order = await Order.create({ buyerId: req.user.id, items: cart.items, totalPrice });

    // Clear cart
    cart.items = [];
    await cart.save();

    // Send order confirmation email (best-effort)
    try {
      const user = await User.findById(req.user.id);
      if (user) {
        await sendOrderConfirmationEmail(user.email, user.name, order._id, totalPrice);
      }
    } catch (err) {
      console.error("Failed to send order confirmation email:", err);
    }

    res.status(201).json({ message: "Order created. Proceed to payment.", order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Get orders of logged-in buyer
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyerId: req.user.id }).populate("items.productId");
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Mark order as paid (simulated)
export const markAsPaid = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, buyerId: req.user.id });
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.paymentStatus = "Paid";
    order.status = "Confirmed";
    await order.save();

    // Send payment confirmation email (best-effort)
    try {
      const user = await User.findById(req.user.id);
      if (user) {
        await sendPaymentConfirmationEmail(user.email, user.name, order._id, order.totalPrice);
      }
    } catch (err) {
      console.error("Failed to send payment confirmation email:", err);
    }

    res.json({ message: "Payment successful (simulated)", order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Cancel order before shipping
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, buyerId: req.user.id });
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.status !== "Pending") return res.status(400).json({ message: "Order cannot be cancelled" });

    order.status = "Cancelled";
    await order.save();

    // Send order cancellation email (best-effort)
    try {
      const user = await User.findById(req.user.id);
      if (user) {
        await sendOrderCancellationEmail(user.email, user.name, order._id);
      }
    } catch (err) {
      console.error("Failed to send order cancellation email:", err);
    }

    res.json({ message: "Order cancelled successfully", order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};