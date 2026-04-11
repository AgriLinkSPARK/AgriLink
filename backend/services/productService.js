// services/productService.js
// Business logic layer for products - Single Responsibility Principle

import Product from "../models/Product.js";
import Store from "../models/Store.js";
import { AppError } from "../utils/errorHandler.js";
import { ERROR_MESSAGES, HTTP_STATUS } from "../constants/index.js";

/**
 * Product Service
 * Handles all product-related business logic
 */
class ProductService {
  /**
   * Get store by farmer ID
   */
  async getStoreByFarmerId(farmerId) {
    const store = await Store.findOne({ farmer: farmerId });
    if (!store) {
      throw new AppError(ERROR_MESSAGES.STORE_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }
    return store;
  }

  /**
   * Verify product ownership
   */
  async verifyProductOwnership(productId, farmerId) {
    const product = await Product.findById(productId);
    if (!product) {
      throw new AppError(ERROR_MESSAGES.PRODUCT_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    const store = await Store.findOne({ farmer: farmerId });
    if (!store || product.store.toString() !== store._id.toString()) {
      throw new AppError(ERROR_MESSAGES.NOT_AUTHORIZED_UPDATE, HTTP_STATUS.FORBIDDEN);
    }

    return { product, store };
  }

  /**
   * Create new product
   */
  async createProduct(farmerId, productData, files) {
    const store = await this.getStoreByFarmerId(farmerId);

    const { name, category, description, price, quantity, unit, availability, harvestDate } = productData;

    // Extract image paths
    const mainImage = files.mainImage?.[0]?.path;
    const extraImages = files.extraImages ? files.extraImages.map(f => f.path) : [];

    if (!mainImage) {
      throw new AppError("Main image is required", HTTP_STATUS.BAD_REQUEST);
    }

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

    return product;
  }

  /**
   * Get all products for a farmer
   */
  async getProductsByFarmerId(farmerId) {
    const store = await this.getStoreByFarmerId(farmerId);
    const products = await Product.find({ store: store._id });
    return products;
  }

  /**
   * Update product
   */
  async updateProduct(productId, farmerId, updates, files) {
    const { product } = await this.verifyProductOwnership(productId, farmerId);

    // Update images if uploaded
    if (files?.mainImage) {
      updates.mainImage = files.mainImage[0].path;
    }
    if (files?.extraImages) {
      updates.extraImages = files.extraImages.map(f => f.path);
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      updates,
      { new: true, runValidators: true }
    );

    return updatedProduct;
  }

  /**
   * Delete product
   */
  async deleteProduct(productId, farmerId) {
    const { product } = await this.verifyProductOwnership(productId, farmerId);
    await product.deleteOne();
    return true;
  }

  /**
   * Get all products (public)
   */
  async getAllProducts(filters = {}) {
    const products = await Product.find(filters).populate({
      path: "store",
      populate: { path: "farmer", select: "_id name" }
    });
    return products;
  }

  /**
   * Get single product by ID
   */
  async getProductById(productId) {
    const product = await Product.findById(productId).populate("store");
    if (!product) {
      throw new AppError(ERROR_MESSAGES.PRODUCT_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }
    return product;
  }

  /**
   * Search products in farmer's store
   */
  async searchProductsInFarmerStore(farmerId, keyword) {
    const store = await this.getStoreByFarmerId(farmerId);

    let query = { store: store._id };

    if (keyword && keyword.trim() !== "") {
      query.$or = [
        { name: { $regex: keyword, $options: "i" } },
        { category: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
      ];
    }

    const products = await Product.find(query);
    return products;
  }
}

// Export singleton instance
export default new ProductService();
