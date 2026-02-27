# AgriLink Architecture & SOLID Principles Documentation

## Overview
This document details the architectural improvements made to the AgriLink backend system, focusing on SOLID principles implementation and code smell elimination.

---

## SOLID Principles Implementation

### 1. Single Responsibility Principle (SRP) ✅

**Definition**: A class/module should have only one reason to change.

#### Implementation:

**Before:**
- Controllers handled validation, business logic, database operations, and email sending
- Mixed concerns in single files

**After:**
- **Controllers**: Only handle HTTP requests/responses
- **Services**: Contains business logic
- **Validators**: Handle input validation
- **Utils**: Specialized utilities (error handling, response formatting)
- **Constants**: Centralized configuration values

**Example:**
```javascript
// Before: authController.js had everything
export const registerCustomer = async (req, res) => {
  // Validation
  if (!name || !email || !password) return res.status(400)...
  
  // Business logic
  const existing = await User.findOne({ email });
  const hashed = await bcrypt.hash(password, 10);
  
  // Email sending
  await sendWelcomeEmail(customer.email, customer.name);
  
  // Response
  res.status(201).json(...)
}

// After: Separated concerns
// Controller (authController.js)
export const registerCustomer = asyncHandler(async (req, res) => {
  const customer = await authService.registerUser(req.body);
  emailService.sendCustomerWelcome(customer.email, customer.name);
  sendCreated(res, { token, role }, "Registration successful");
});

// Service layer handles business logic (authService.js)
// Validator handles validation (authValidator.js)
// Utils handle errors and responses (errorHandler.js, responseHandler.js)
```

---

### 2. Open/Closed Principle (OCP) ✅

**Definition**: Software entities should be open for extension but closed for modification.

#### Implementation:

**Constants System:**
```javascript
// constants/index.js
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
```

**Benefits:**
- Adding new roles: Just add to `USER_ROLES` constant
- Adding new statuses: Just add to respective constant
- No need to modify multiple files
- Type-safe enums in one place

**Service Layer Pattern:**
```javascript
// Services can be extended without modifying existing code
class AuthService {
  async registerUser(userData) {
    // Core logic
  }
  
  // Can add new methods without changing existing ones
  async registerWithOAuth(oauthData) {
    // New feature
  }
}
```

---

### 3. Liskov Substitution Principle (LSP) ⚠️

**Status**: Not directly applicable (JavaScript doesn't have strict inheritance)

**Note**: While JavaScript/Node.js doesn't enforce LSP in the same way as strongly-typed languages, we maintain behavioral consistency:

```javascript
// All service methods follow same error handling pattern
class ProductService {
  async getProductById(id) {
    if (!product) throw new AppError(ERROR_MESSAGES.PRODUCT_NOT_FOUND, 404);
  }
}

class OrderService {
  async getOrderById(id) {
    if (!order) throw new AppError(ERROR_MESSAGES.ORDER_NOT_FOUND, 404);
  }
}
// Both throw AppError consistently
```

---

### 4. Interface Segregation Principle (ISP) ⚠️

**Status**: Not directly applicable (JavaScript doesn't have interfaces)

**Implementation Approach**: Small, focused modules

```javascript
// Instead of one large service, we have focused services
- authService.js    // Only auth operations
- productService.js // Only product operations
- orderService.js   // Only order operations
- emailService.js   // Only email operations
```

Each service exposes only the methods needed for its domain.

---

### 5. Dependency Inversion Principle (DIP) ✅

**Definition**: High-level modules shouldn't depend on low-level modules. Both should depend on abstractions.

#### Implementation:

**Before:**
```javascript
// Controller directly depends on concrete implementations
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const login = async (req, res) => {
  const user = await User.findOne({ email }); // Direct dependency
  await bcrypt.compare(password, user.password); // Direct dependency
}
```

**After:**
```javascript
// Controller depends on service abstraction
import authService from "../services/authService.js";

export const login = asyncHandler(async (req, res) => {
  const loginData = await authService.loginUser(email, password);
  sendSuccess(res, loginData);
});

// Service encapsulates dependencies
class AuthService {
  async loginUser(email, password) {
    const user = await this.validateCredentials(email, password);
    // ... logic
  }
}
```

**Benefits:**
- Controllers don't know about bcrypt, jwt, or database details
- Easy to swap implementations (e.g., different auth provider)
- Easy to test (mock the service)

---

## Code Smells Eliminated

### 1. ❌ Duplicated Code → ✅ DRY (Don't Repeat Yourself)

**Before:**
```javascript
// Repeated in every controller method
try {
  // ... logic
} catch (err) {
  console.error(err);
  res.status(500).json({ message: "Server error" });
}
```

**After:**
```javascript
// utils/errorHandler.js - Single place for error handling
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Global error middleware
export const errorMiddleware = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json(formatErrorResponse(err));
};

// Usage: No try-catch needed
export const login = asyncHandler(async (req, res) => {
  // Clean code without try-catch
});
```

---

### 2. ❌ Magic Strings/Numbers → ✅ Named Constants

**Before:**
```javascript
if (user.role === "customer") // Magic string
return res.status(401).json({ message: "Invalid credentials" }); // Magic number
```

**After:**
```javascript
// constants/index.js
export const USER_ROLES = { CUSTOMER: "customer" };
export const HTTP_STATUS = { UNAUTHORIZED: 401 };
export const ERROR_MESSAGES = { INVALID_CREDENTIALS: "Invalid credentials" };

// Usage
if (user.role === USER_ROLES.CUSTOMER)
throw new AppError(ERROR_MESSAGES.INVALID_CREDENTIALS, HTTP_STATUS.UNAUTHORIZED);
```

---

### 3. ❌ Long Methods → ✅ Small, Focused Methods

**Before:**
```javascript
export const checkout = async (req, res) => {
  // 50+ lines of cart logic, order creation, email sending, error handling
}
```

**After:**
```javascript
// Controller - 6 lines
export const checkout = asyncHandler(async (req, res) => {
  const order = await orderService.createOrderFromCart(req.user.id);
  const user = await authService.getUserById(req.user.id);
  emailService.sendOrderConfirmation(user.email, user.name, order._id, order.totalPrice);
  sendCreated(res, { order }, "Order created successfully");
});

// Service - Focused methods
class OrderService {
  async createOrderFromCart(buyerId) {
    const cart = await this.getCartByBuyerId(buyerId);
    const totalPrice = this.calculateTotalPrice(cart.items);
    // ... create order logic
  }
}
```

---

### 4. ❌ Feature Envy → ✅ Data and Behavior Together

**Before:**
```javascript
// Controller accessing too many properties of other objects
const store = await Store.findOne({ farmer: req.user.id });
if (product.store.toString() !== store._id.toString()) // Feature envy
```

**After:**
```javascript
// Service encapsulates the logic
async verifyProductOwnership(productId, farmerId) {
  const product = await Product.findById(productId);
  const store = await Store.findOne({ farmer: farmerId });
  if (!store || product.store.toString() !== store._id.toString()) {
    throw new AppError(ERROR_MESSAGES.NOT_AUTHORIZED);
  }
  return { product, store };
}
```

---

### 5. ❌ Inconsistent Error Handling → ✅ Standardized Responses

**Before:**
```javascript
// Different response formats everywhere
res.status(404).json({ message: "Not found" });
res.json({ success: true, data: product });
return res.status(400).json({ error: "Bad request" });
```

**After:**
```javascript
// utils/responseHandler.js - Consistent format
export const sendSuccess = (res, data, message, statusCode) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

// All responses now consistent
sendSuccess(res, product, "Product retrieved");
sendError(res, ERROR_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
```

---

### 6. ❌ Dead Code → ✅ Clean Codebase

**Before:**
```javascript
// models/Store.js had commented out code
// import mongoose from "mongoose";
// const storeSchema = new mongoose.Schema(
//   { ... old code ... }
// );
```

**After:**
```javascript
// Removed all commented code
// Clean, maintainable codebase
```

---

### 7. ❌ Primitive Obsession → ✅ Semantic Types

**Before:**
```javascript
user.role = "admin"; // Just a string
order.status = "Pending"; // Just a string
```

**After:**
```javascript
// Using constants provides semantic meaning
user.role = USER_ROLES.ADMIN;
order.status = ORDER_STATUS.PENDING;

// Models enforce valid values
role: {
  type: String,
  enum: Object.values(USER_ROLES),
  default: USER_ROLES.CUSTOMER,
}
```

---

## Architecture Layers

```
┌─────────────────────────────────────────────────────┐
│                    Routes Layer                     │
│  (authRoutes.js, productRoutes.js, etc.)          │
│  - Route definitions                               │
│  - Middleware application (auth, validation)       │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│                 Controller Layer                    │
│  (authController.js, productController.js, etc.)   │
│  - HTTP request/response handling                  │
│  - Delegates to services                           │
│  - Response formatting                             │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│                  Service Layer                      │
│  (authService.js, productService.js, etc.)         │
│  - Business logic                                  │
│  - Complex operations                              │
│  - Reusable methods                                │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│                   Model Layer                       │
│  (User.js, Product.js, Order.js, etc.)            │
│  - Data structure                                  │
│  - Database schema                                 │
│  - Validation rules                                │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│                 Support Layers                      │
├─────────────────────────────────────────────────────┤
│  Validators: Input validation (authValidator.js)   │
│  Utils: Helpers (errorHandler.js, responseHandler) │
│  Constants: Shared values (constants/index.js)     │
│  Middleware: Request processing (auth, role check) │
└─────────────────────────────────────────────────────┘
```

---

## File Structure

```
backend/
├── constants/
│   └── index.js                 # All constants (DRY, OCP)
│
├── services/                    # Business logic (SRP, DIP)
│   ├── authService.js          # Authentication logic
│   ├── productService.js       # Product operations
│   ├── orderService.js         # Order operations
│   └── emailService.js         # Email operations
│
├── validators/                 # Input validation (SRP)
│   ├── authValidator.js
│   └── productValidator.js
│
├── utils/                      # Utilities (SRP)
│   ├── errorHandler.js         # Error handling
│   ├── responseHandler.js      # Response formatting
│   └── mailer.js              # Email transport
│
├── controllers/               # HTTP handlers (SRP, DIP)
│   ├── authController.js
│   ├── productController.js
│   └── orderController.js
│
├── models/                   # Data layer
│   ├── User.js
│   ├── Product.js
│   ├── Order.js
│   └── Store.js
│
├── routes/                   # Route definitions
│   ├── authRoutes.js
│   └── productRoutes.js
│
├── middleware/              # Request processing
│   ├── authMiddleware.js
│   └── roleMiddleware.js
│
└── server.js               # Application entry point
```

---

## Benefits of New Architecture

### 1. **Maintainability** ✅
- Easy to locate code (clear separation of concerns)
- Changes isolated to specific layers
- Reduced risk of breaking changes

### 2. **Testability** ✅
- Services can be unit tested independently
- Controllers can be tested with mocked services
- Validators can be tested separately

### 3. **Reusability** ✅
- Services can be used by multiple controllers
- Common utilities shared across application
- Constants prevent duplication

### 4. **Scalability** ✅
- Easy to add new features (just add new service methods)
- Easy to add new roles/statuses (just update constants)
- Clear patterns for new developers

### 5. **Debugging** ✅
- Consistent error handling
- Clear error messages from constants
- Proper error logging with context

### 6. **Code Quality** ✅
- No magic strings/numbers
- No duplicated code
- Clean, readable methods
- Consistent formatting

---

## Testing Strategy (Recommended)

```javascript
// Unit Tests
- Test services independently
- Mock database calls
- Test error conditions

// Integration Tests
- Test controller + service + database
- Test complete request flow
- Test error handling

// Example:
describe('AuthService', () => {
  it('should register user successfully', async () => {
    const userData = { name: 'Test', email: 'test@example.com', password: '123456' };
    const user = await authService.registerUser(userData);
    expect(user.email).toBe('test@example.com');
  });
  
  it('should throw error for duplicate email', async () => {
    // Test error case
  });
});
```

---

## Migration Guide

### For Existing Code:

1. **Controllers**: Use `asyncHandler` wrapper
2. **Responses**: Use `sendSuccess/sendCreated/sendError`
3. **Errors**: Throw `AppError` with constants
4. **Business Logic**: Move to service layer
5. **Constants**: Import from `constants/index.js`

### Example Migration:

```javascript
// OLD
export const myController = async (req, res) => {
  try {
    if (user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }
    // ... logic
    res.json({ data: result });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// NEW
export const myController = asyncHandler(async (req, res) => {
  if (user.role !== USER_ROLES.ADMIN) {
    throw new AppError(ERROR_MESSAGES.NOT_AUTHORIZED, HTTP_STATUS.FORBIDDEN);
  }
  const result = await myService.doSomething();
  sendSuccess(res, result);
});
```

---

## Further Improvements (Future)

1. **Add TypeScript** for type safety
2. **Implement DTOs** (Data Transfer Objects) for request/response
3. **Add Repository Pattern** for database abstraction
4. **Implement Caching Layer** (Redis)
5. **Add API Versioning** (/api/v1/...)
6. **Implement Rate Limiting**
7. **Add Comprehensive Logging** (Winston/Morgan)
8. **Add API Documentation** (Swagger/OpenAPI)
9. **Implement Event-Driven Architecture** (for emails, notifications)
10. **Add Database Transactions** for complex operations

---

## Summary

The refactored AgriLink backend now follows:
- ✅ **SOLID Principles**: Clean, maintainable, extensible code
- ✅ **Layered Architecture**: Clear separation of concerns
- ✅ **Best Practices**: DRY, consistent error handling, proper validations
- ✅ **Code Quality**: No magic strings, no dead code, small focused methods

This architecture provides a solid foundation for scaling the application and maintaining it long-term.
