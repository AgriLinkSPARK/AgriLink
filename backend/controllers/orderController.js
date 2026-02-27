// controllers/orderController.js
// Controller layer - handles HTTP requests/responses only
// Business logic moved to service layer (SOLID: SRP, DIP)

import orderService from "../services/orderService.js";
import emailService from "../services/emailService.js";
import authService from "../services/authService.js";
import { asyncHandler } from "../utils/errorHandler.js";
import { sendSuccess, sendCreated } from "../utils/responseHandler.js";
import { SUCCESS_MESSAGES } from "../constants/index.js";

// Checkout → create order from cart
export const checkout = asyncHandler(async (req, res) => {
  // Business logic handled by service
  const order = await orderService.createOrderFromCart(req.user.id);

  // Send order confirmation email (best-effort, non-blocking)
  const user = await authService.getUserById(req.user.id);
  emailService.sendOrderConfirmation(user.email, user.name, order._id, order.totalPrice);

  sendCreated(
    res,
    { order },
    "Order created successfully. Proceed to payment."
  );
});

// Get orders of logged-in buyer
export const getMyOrders = asyncHandler(async (req, res) => {
  // Business logic handled by service
  const orders = await orderService.getOrdersByBuyerId(req.user.id);

  sendSuccess(res, orders);
});

// Mark order as paid (simulated)
export const markAsPaid = asyncHandler(async (req, res) => {
  // Business logic handled by service
  const order = await orderService.markOrderAsPaid(req.params.id, req.user.id);

  // Send payment confirmation email (best-effort, non-blocking)
  const user = await authService.getUserById(req.user.id);
  emailService.sendPaymentConfirmation(user.email, user.name, order._id, order.totalPrice);

  sendSuccess(res, { order }, "Payment successful (simulated)");
});

// Cancel order before shipping
export const cancelOrder = asyncHandler(async (req, res) => {
  // Business logic handled by service
  const order = await orderService.cancelOrder(req.params.id, req.user.id);

  // Send order cancellation email (best-effort, non-blocking)
  const user = await authService.getUserById(req.user.id);
  emailService.sendOrderCancellation(user.email, user.name, order._id);

  sendSuccess(res, { order }, "Order cancelled successfully");
});