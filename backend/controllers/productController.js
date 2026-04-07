// controllers/productController.js
// Controller layer - handles HTTP requests/responses only
// Business logic moved to service layer (SOLID: SRP, DIP)

import productService from "../services/productService.js";
import Store from "../models/Store.js";
import { asyncHandler } from "../utils/errorHandler.js";
import { sendSuccess, sendCreated } from "../utils/responseHandler.js";
import { SUCCESS_MESSAGES } from "../constants/index.js";

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/products/all  (public — any logged-in user, including customers)
// Returns all products across all stores so customers can browse & add to cart
// ─────────────────────────────────────────────────────────────────────────────
export const getAllProducts = asyncHandler(async (req, res) => {
  const products = await productService.getAllProducts();
  sendSuccess(res, products, "Products retrieved successfully");
});

// Create product
export const createProduct = asyncHandler(async (req, res) => {
  // Ensure the farmer has a store before creating a product
  const store = await Store.findOne({ farmer: req.user.id });
  if (!store) {
    return res.status(404).json({ message: "Store not found" });
  }

  const product = await productService.createProduct(
    req.user.id,
    req.body,
    req.files
  );

  sendCreated(res, product, "Product created successfully");
});

// Get all products of the farmer's store
export const getProducts = asyncHandler(async (req, res) => {
  // Business logic handled by service
  const products = await productService.getProductsByFarmerId(req.user.id);

  sendSuccess(res, products);
});

// Update a product
export const updateProduct = asyncHandler(async (req, res) => {
  // Business logic handled by service
  const updatedProduct = await productService.updateProduct(
    req.params.id,
    req.user.id,
    req.body,
    req.files
  );

  sendSuccess(res, updatedProduct, "Product updated successfully");
});

// Delete a product
export const deleteProduct = asyncHandler(async (req, res) => {
  // Business logic handled by service
  await productService.deleteProduct(req.params.id, req.user.id);

  sendSuccess(res, null, SUCCESS_MESSAGES.PRODUCT_DELETED);
});


// Get single product by ID
export const getProductById = asyncHandler(async (req, res) => {
  // Business logic handled by service
  const product = await productService.getProductById(req.params.id);

  sendSuccess(res, product);
});

// Search products inside farmer's store
export const searchProducts = asyncHandler(async (req, res) => {
  const { keyword } = req.query;

  // Business logic handled by service
  const products = await productService.searchProductsInFarmerStore(
    req.user.id,
    keyword
  );

  sendSuccess(
    res,
    {
      count: products.length,
      products,
    },
    products.length === 0 ? "No matching products found" : "Products found"
  );
});