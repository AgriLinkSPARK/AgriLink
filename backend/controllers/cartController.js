import Cart from "../models/Cart.js";
import { asyncHandler } from "../utils/errorHandler.js";
import { sendSuccess } from "../utils/responseHandler.js";

// Add to cart
export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  let cart = await Cart.findOne({ buyerId: req.user.id });

  if (!cart) {
    cart = await Cart.create({ buyerId: req.user.id, items: [{ productId, quantity }] });
  } else {
    const item = cart.items.find(i => i.productId.toString() === productId);
    if (item) item.quantity += quantity;
    else cart.items.push({ productId, quantity });
    await cart.save();
  }

  sendSuccess(res, cart, "Item added to cart");
});

// Get cart
export const getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ buyerId: req.user.id }).populate("items.productId");
  
  // Return empty cart structure if cart doesn't exist
  if (!cart) {
    cart = { buyerId: req.user.id, items: [] };
  }

  sendSuccess(res, cart, "Cart retrieved successfully");
});

// Update quantity
export const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const cart = await Cart.findOne({ buyerId: req.user.id });
  const item = cart.items.find(i => i.productId.toString() === req.params.productId);
  if (!item) throw new Error("Item not found");

  item.quantity = quantity;
  await cart.save();
  sendSuccess(res, cart, "Cart updated successfully");
});

// Remove item
export const removeFromCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ buyerId: req.user.id });
  cart.items = cart.items.filter(i => i.productId.toString() !== req.params.productId);
  await cart.save();
  sendSuccess(res, cart, "Item removed from cart");
});