import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import { asyncHandler } from "../utils/errorHandler.js";
import { sendSuccess } from "../utils/responseHandler.js";

// Add to cart
export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  
  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }

  let cart = await Cart.findOne({ buyerId: req.user.id });

  if (!cart) {
    cart = await Cart.create({ buyerId: req.user.id, items: [{ productId, name: product.name, price: product.price, quantity }] });
  } else {
    const item = cart.items.find(i => i.productId.toString() === productId);
    if (item) {
      item.quantity += quantity;
      item.name = product.name;
      item.price = product.price;
    } else {
      cart.items.push({ productId, name: product.name, price: product.price, quantity });
    }
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

  // Retroactively patch name and price for ancient cart items
  if (!item.name || !item.price) {
    const product = await Product.findById(req.params.productId);
    if (product) {
      item.name = product.name;
      item.price = product.price;
    }
  }

  item.quantity = quantity;
  
  // Ensure mongoose tracks deep array mutations
  cart.markModified('items');
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