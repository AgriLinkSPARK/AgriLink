// constants/index.js
// Central place for all constants - eliminates magic strings

export const USER_ROLES = {
  ADMIN: "admin",
  FARMER: "farmer",
  CUSTOMER: "customer",
};

export const ORDER_STATUS = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export const PAYMENT_STATUS = {
  PENDING: "Pending",
  PAID: "Paid",
  FAILED: "Failed",
  REFUNDED: "Refunded",
};

export const PRODUCT_AVAILABILITY = {
  IN_STOCK: "in-Stock",
  OUT_OF_STOCK: "out-of-stock",
};

export const PRODUCT_UNITS = {
  KG: "kg",
  GRAM: "g",
  LITRE: "l",
  PIECE: "piece",
  DOZEN: "dozen",
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVICE_UNAVAILABLE: 503,
  INTERNAL_SERVER_ERROR: 500,
};

export const ERROR_MESSAGES = {
  // Auth errors
  INVALID_CREDENTIALS: "Invalid credentials",
  UNAUTHORIZED_ACCESS: "Not authorized",
  NO_TOKEN: "No token provided",
  INVALID_TOKEN: "Invalid token",
  ALL_FIELDS_REQUIRED: "All fields are required",
  EMAIL_EXISTS: "Email already exists",
  
  // Resource errors
  NOT_FOUND: "Resource not found",
  STORE_NOT_FOUND: "Store not found",
  PRODUCT_NOT_FOUND: "Product not found",
  ORDER_NOT_FOUND: "Order not found",
  CART_EMPTY: "Cart is empty",
  
  // Permission errors
  NOT_AUTHORIZED_UPDATE: "Not authorized to update this resource",
  NOT_AUTHORIZED_DELETE: "Not authorized to delete this resource",
  USE_CUSTOMER_LOGIN: "Use customer login endpoint",
  USE_ADMIN_FARMER_LOGIN: "Use admin/farmer login endpoint",
  FARMERS_ONLY: "Only farmers can access this resource",
  
  // Order errors
  CANNOT_CANCEL_ORDER: "Order cannot be cancelled",
  
  // Generic
  SERVER_ERROR: "Server error",
};

export const SUCCESS_MESSAGES = {
  PRODUCT_DELETED: "Product deleted successfully",
  ORDER_CREATED: "Order created successfully",
  PAYMENT_SUCCESS: "Payment successful",
};
