// controllers/productController.js
import Product from "../models/Product.js";
import Store from "../models/Store.js";

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/products/all  (public — any logged-in user, including customers)
// Returns all products across all stores so customers can browse & add to cart
// ─────────────────────────────────────────────────────────────────────────────
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({ availability: "in-Stock" })
      .populate("store", "name")
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Create product
export const createProduct = async (req, res) => {
  try {

    console.log("BODY:", req.body);
    console.log("FILES:", req.files);
    // Find the farmer's store
    const store = await Store.findOne({ farmer: req.user.id });
    if (!store) return res.status(404).json({ message: "Store not found" });

    const { name, category, description, price, quantity, unit, availability, harvestDate } = req.body;

    // Images
    const mainImage = req.files.mainImage[0].path;
    const extraImages = req.files.extraImages ? req.files.extraImages.map(f => f.path) : [];

    const product = await Product.create({
      store: store._id,
      name,
      category,
      description,
      price,
      quantity,
      unit,
      mainImage,
      extraImages,
      availability,
      harvestDate,
    });

    res.status(201).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all products of the farmer's store
export const getProducts = async (req, res) => {
  try {
    const store = await Store.findOne({ farmer: req.user.id });
    if (!store) return res.status(404).json({ message: "Store not found" });

    const products = await Product.find({ store: store._id });
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update a product
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const store = await Store.findOne({ farmer: req.user.id });
    if (!store || product.store.toString() !== store._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this product" });
    }

    const updates = req.body;

    // Update images if uploaded
    if (req.files.mainImage) updates.mainImage = req.files.mainImage[0].path;
    if (req.files.extraImages) updates.extraImages = req.files.extraImages.map(f => f.path);

    const updatedProduct = await Product.findByIdAndUpdate(product._id, updates, { new: true });
    res.json(updatedProduct);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a product
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const store = await Store.findOne({ farmer: req.user.id });
    if (!store || product.store.toString() !== store._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this product" });
    }

    await product.deleteOne();
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};