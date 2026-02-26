import Cart from "../models/Cart.js";

// Add to cart
export const addToCart = async (req, res) => {
  try {
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

    res.json(cart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Get cart
export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ buyerId: req.user.id }).populate("items.productId");
    res.json(cart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Update quantity
export const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ buyerId: req.user.id });
    const item = cart.items.find(i => i.productId.toString() === req.params.productId);
    if (!item) return res.status(404).json({ message: "Item not found" });

    item.quantity = quantity;
    await cart.save();
    res.json(cart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Remove item
export const removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ buyerId: req.user.id });
    cart.items = cart.items.filter(i => i.productId.toString() !== req.params.productId);
    await cart.save();
    res.json(cart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};