// validators/productValidator.js
// Product validation layer - Single Responsibility Principle

import { HTTP_STATUS } from "../constants/index.js";
import { AppError } from "../utils/errorHandler.js";

/**
 * Validate product creation data
 */
export const validateProductData = (req, res, next) => {
  const { name, category, price, quantity } = req.body;

  if (!name || !category || !price || !quantity) {
    throw new AppError("Name, category, price, and quantity are required", HTTP_STATUS.BAD_REQUEST);
  }

  if (isNaN(price) || price <= 0) {
    throw new AppError("Price must be a positive number", HTTP_STATUS.BAD_REQUEST);
  }

  if (isNaN(quantity) || quantity < 0) {
    throw new AppError("Quantity must be a non-negative number", HTTP_STATUS.BAD_REQUEST);
  }

  next();
};

/**
 * Validate product ID parameter
 */
export const validateProductId = (req, res, next) => {
  const { id } = req.params;

  if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
    throw new AppError("Invalid product ID", HTTP_STATUS.BAD_REQUEST);
  }

  next();
};
