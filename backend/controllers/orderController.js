// backend/controllers/orderController.js
import Order from "../models/order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/orders/checkout
// Creates an order from the buyer's current cart.
// Calculates totalPrice from real product prices populated from DB.
// ─────────────────────────────────────────────────────────────────────────────
export const checkout = async (req, res) => {
  try {
    const cart = await Cart.findOne({ buyerId: req.user.id }).populate(
      "items.productId"
    );
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty." });
    }

    // Calculate totalPrice from real product prices
    let totalPrice = 0;
    for (const item of cart.items) {
      const product = item.productId; // populated
      if (!product) {
        return res
          .status(400)
          .json({ message: "One or more products in your cart no longer exist." });
      }
      if (product.availability === "out-of-stock") {
        return res.status(400).json({
          message: `"${product.name}" is currently out of stock.`
        });
      }
      totalPrice += item.quantity * product.price;
    }

    // Build items array with just the IDs (no populated objects)
    const items = cart.items.map((i) => ({
      productId: i.productId._id,
      quantity: i.quantity
    }));

    const order = await Order.create({
      buyerId: req.user.id,
      items,
      totalPrice: Math.round(totalPrice * 100) / 100 // round to 2dp
    });

    // Clear cart after order is placed
    cart.items = [];
    await cart.save();

    res.status(201).json({
      message: "Order created. Proceed to payment.",
      order
    });
  } catch (err) {
    console.error("[checkout]", err);
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/orders/my-orders
// Returns all orders for the logged-in buyer.
// ─────────────────────────────────────────────────────────────────────────────
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyerId: req.user.id })
      .populate("items.productId")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error("[getMyOrders]", err);
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/orders/cancel/:id
// Buyer cancels their own order (only allowed when status is Pending).
// ─────────────────────────────────────────────────────────────────────────────
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, buyerId: req.user.id });
    if (!order) return res.status(404).json({ message: "Order not found." });

    if (order.status !== "Pending") {
      return res.status(400).json({ message: "Order cannot be cancelled at this stage." });
    }

    if (order.paymentStatus === "Paid") {
      return res
        .status(400)
        .json({ message: "Paid orders cannot be cancelled. Please request a refund." });
    }

    order.status = "Cancelled";
    await order.save();

    res.json({ message: "Order cancelled successfully.", order });
  } catch (err) {
    console.error("[cancelOrder]", err);
    res.status(500).json({ message: err.message });
  }
};