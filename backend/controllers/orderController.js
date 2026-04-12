import Order from "../models/order.js";
import Cart from "../models/Cart.js";
import { sendSuccess, sendCreated } from "../utils/responseHandler.js";

// Checkout → create order from cart
export const checkout = async (req, res) => {
  try {
    const cart = await Cart.findOne({ buyerId: req.user.id }).populate("items.productId");
    if (!cart || cart.items.length === 0) return res.status(400).json({ message: "Cart is empty" });

    // Build items with names and calculate actual real price
    const orderItems = cart.items.map(item => ({
      productId: item.productId._id,
      name: item.productId.name || "Unknown Product",
      price: item.productId.price || 0,
      quantity: item.quantity
    }));

    const totalPrice = orderItems.reduce((sum, item) => sum + item.quantity * item.price, 0);

    const order = await Order.create({ buyerId: req.user.id, items: orderItems, totalPrice });

    // Clear cart
    cart.items = [];
    await cart.save();

    sendCreated(res, order, "Order created. Proceed to payment.");
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Get orders of logged-in buyer
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyerId: req.user.id }).populate("items.productId");
    sendSuccess(res, orders, "Orders retrieved successfully");
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

    sendSuccess(res, order, "Payment successful (simulated)");
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

    sendSuccess(res, order, "Order cancelled successfully");
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};