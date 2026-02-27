// services/orderService.js
// Business logic layer for orders - Single Responsibility Principle

import Order from "../models/order.js";
import Cart from "../models/Cart.js";
import { AppError } from "../utils/errorHandler.js";
import { ERROR_MESSAGES, HTTP_STATUS, ORDER_STATUS, PAYMENT_STATUS } from "../constants/index.js";

/**
 * Order Service
 * Handles all order-related business logic
 */
class OrderService {
  /**
   * Calculate total price from cart items
   */
  calculateTotalPrice(items) {
    // TODO: Implement proper price calculation based on actual product prices
    return items.reduce((sum, item) => sum + (item.quantity * (item.price || 10)), 0);
  }

  /**
   * Get cart by buyer ID
   */
  async getCartByBuyerId(buyerId) {
    const cart = await Cart.findOne({ buyerId });
    if (!cart || cart.items.length === 0) {
      throw new AppError(ERROR_MESSAGES.CART_EMPTY, HTTP_STATUS.BAD_REQUEST);
    }
    return cart;
  }

  /**
   * Create order from cart
   */
  async createOrderFromCart(buyerId) {
    const cart = await this.getCartByBuyerId(buyerId);

    const totalPrice = this.calculateTotalPrice(cart.items);

    const order = await Order.create({
      buyerId,
      items: cart.items,
      totalPrice,
      status: ORDER_STATUS.PENDING,
      paymentStatus: PAYMENT_STATUS.PENDING,
    });

    // Clear cart
    cart.items = [];
    await cart.save();

    return order;
  }

  /**
   * Get orders by buyer ID
   */
  async getOrdersByBuyerId(buyerId) {
    const orders = await Order.find({ buyerId }).populate("items.productId");
    return orders;
  }

  /**
   * Get order by ID and verify ownership
   */
  async getOrderByIdAndVerifyOwnership(orderId, buyerId) {
    const order = await Order.findOne({ _id: orderId, buyerId });
    if (!order) {
      throw new AppError(ERROR_MESSAGES.ORDER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }
    return order;
  }

  /**
   * Mark order as paid
   */
  async markOrderAsPaid(orderId, buyerId) {
    const order = await this.getOrderByIdAndVerifyOwnership(orderId, buyerId);

    order.paymentStatus = PAYMENT_STATUS.PAID;
    order.status = ORDER_STATUS.CONFIRMED;
    await order.save();

    return order;
  }

  /**
   * Cancel order
   */
  async cancelOrder(orderId, buyerId) {
    const order = await this.getOrderByIdAndVerifyOwnership(orderId, buyerId);

    if (order.status !== ORDER_STATUS.PENDING) {
      throw new AppError(ERROR_MESSAGES.CANNOT_CANCEL_ORDER, HTTP_STATUS.BAD_REQUEST);
    }

    order.status = ORDER_STATUS.CANCELLED;
    await order.save();

    return order;
  }

  /**
   * Get all orders (admin)
   */
  async getAllOrders(filters = {}) {
    const orders = await Order.find(filters).populate("buyerId items.productId");
    return orders;
  }

  /**
   * Update order status (admin/logistics)
   */
  async updateOrderStatus(orderId, status) {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new AppError(ERROR_MESSAGES.ORDER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    order.status = status;
    await order.save();

    return order;
  }
}

// Export singleton instance
export default new OrderService();
