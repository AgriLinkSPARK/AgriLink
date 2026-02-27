# Quick Reference Guide - SOLID Principles in AgriLink

## How to Use the New Architecture

### 1. Creating a New Controller

```javascript
// controllers/myController.js
import myService from "../services/myService.js";
import { asyncHandler } from "../utils/errorHandler.js";
import { sendSuccess, sendCreated } from "../utils/responseHandler.js";
import { ERROR_MESSAGES, HTTP_STATUS } from "../constants/index.js";

// All controller methods should use asyncHandler
export const getItems = asyncHandler(async (req, res) => {
  const items = await myService.getAllItems();
  sendSuccess(res, items, "Items retrieved successfully");
});

export const createItem = asyncHandler(async (req, res) => {
  const item = await myService.createItem(req.body);
  sendCreated(res, item, "Item created successfully");
});
```

### 2. Creating a New Service

```javascript
// services/myService.js
import MyModel from "../models/MyModel.js";
import { AppError } from "../utils/errorHandler.js";
import { ERROR_MESSAGES, HTTP_STATUS } from "../constants/index.js";

class MyService {
  async getAllItems() {
    const items = await MyModel.find();
    return items;
  }

  async createItem(data) {
    // Validate
    if (!data.name) {
      throw new AppError("Name is required", HTTP_STATUS.BAD_REQUEST);
    }
    
    // Business logic
    const item = await MyModel.create(data);
    return item;
  }

  async getItemById(id) {
    const item = await MyModel.findById(id);
    if (!item) {
      throw new AppError(ERROR_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }
    return item;
  }
}

export default new MyService();
```

### 3. Creating a Validator

```javascript
// validators/myValidator.js
import { HTTP_STATUS } from "../constants/index.js";
import { AppError } from "../utils/errorHandler.js";

export const validateItemData = (req, res, next) => {
  const { name, price } = req.body;

  if (!name) {
    throw new AppError("Name is required", HTTP_STATUS.BAD_REQUEST);
  }

  if (!price || price <= 0) {
    throw new AppError("Valid price is required", HTTP_STATUS.BAD_REQUEST);
  }

  next();
};
```

### 4. Adding Routes with Validation

```javascript
// routes/myRoutes.js
import express from "express";
import { getItems, createItem } from "../controllers/myController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { validateItemData } from "../validators/myValidator.js";
import { asyncHandler } from "../utils/errorHandler.js";
import { USER_ROLES } from "../constants/index.js";

const router = express.Router();

// Public route
router.get("/", getItems);

// Protected route with validation
router.post(
  "/",
  protect,
  authorize(USER_ROLES.ADMIN, USER_ROLES.FARMER),
  asyncHandler(validateItemData),
  createItem
);

export default router;
```

### 5. Error Handling

```javascript
// DON'T do this (old way):
try {
  const user = await User.findById(id);
  if (!user) return res.status(404).json({ message: "Not found" });
} catch (err) {
  res.status(500).json({ message: "Server error" });
}

// DO this (new way):
export const getUser = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  sendSuccess(res, user);
});

// In service:
async getUserById(id) {
  const user = await User.findById(id);
  if (!user) {
    throw new AppError(ERROR_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }
  return user;
}
```

### 6. Using Constants

```javascript
// DON'T do this (old way):
if (user.role === "admin") {
  res.status(403).json({ message: "Not authorized" });
}

// DO this (new way):
import { USER_ROLES, ERROR_MESSAGES, HTTP_STATUS } from "../constants/index.js";

if (user.role === USER_ROLES.ADMIN) {
  throw new AppError(ERROR_MESSAGES.NOT_AUTHORIZED, HTTP_STATUS.FORBIDDEN);
}
```

### 7. Response Formatting

```javascript
// DON'T do this (old way):
res.json({ success: true, data: items });
res.status(201).json({ item });
res.status(404).json({ message: "Not found" });

// DO this (new way):
import { sendSuccess, sendCreated, sendError } from "../utils/responseHandler.js";

sendSuccess(res, items);                          // 200 with data
sendCreated(res, item, "Item created");          // 201 with data
// For errors, throw AppError in service layer
```

## Common Patterns

### Pattern 1: CRUD Operations

```javascript
// Service Layer
class ResourceService {
  async getAll() { /* ... */ }
  async getById(id) { /* ... */ }
  async create(data) { /* ... */ }
  async update(id, data) { /* ... */ }
  async delete(id) { /* ... */ }
}

// Controller Layer
export const getAll = asyncHandler(async (req, res) => {
  const items = await resourceService.getAll();
  sendSuccess(res, items);
});

export const create = asyncHandler(async (req, res) => {
  const item = await resourceService.create(req.body);
  sendCreated(res, item);
});
```

### Pattern 2: Authentication Flow

```javascript
// 1. Validator checks input format
export const validateLoginData = (req, res, next) => {
  if (!req.body.email || !req.body.password) {
    throw new AppError(ERROR_MESSAGES.ALL_FIELDS_REQUIRED, HTTP_STATUS.BAD_REQUEST);
  }
  next();
};

// 2. Controller delegates to service
export const login = asyncHandler(async (req, res) => {
  const loginData = await authService.loginUser(req.body.email, req.body.password);
  sendSuccess(res, loginData);
});

// 3. Service handles business logic
async loginUser(email, password) {
  const user = await this.validateCredentials(email, password);
  return {
    token: this.generateToken(user),
    role: user.role,
  };
}
```

### Pattern 3: Authorization

```javascript
// In routes
router.get(
  "/admin-only",
  protect,                              // Check if authenticated
  authorize(USER_ROLES.ADMIN),         // Check if admin
  myController
);

// In controller (if additional checks needed)
export const myController = asyncHandler(async (req, res) => {
  // req.user.id and req.user.role are available from protect middleware
  const data = await myService.getData(req.user.id);
  sendSuccess(res, data);
});

// In service (ownership verification)
async verifyOwnership(resourceId, userId) {
  const resource = await MyModel.findById(resourceId);
  if (!resource || resource.userId.toString() !== userId) {
    throw new AppError(ERROR_MESSAGES.NOT_AUTHORIZED, HTTP_STATUS.FORBIDDEN);
  }
  return resource;
}
```

## Constants Reference

```javascript
// Import what you need
import { 
  USER_ROLES,           // ADMIN, FARMER, CUSTOMER
  ORDER_STATUS,         // PENDING, CONFIRMED, SHIPPED, etc.
  PAYMENT_STATUS,       // PENDING, PAID, FAILED, REFUNDED
  PRODUCT_AVAILABILITY, // IN_STOCK, OUT_OF_STOCK
  HTTP_STATUS,          // OK (200), CREATED (201), etc.
  ERROR_MESSAGES,       // Pre-defined error messages
  SUCCESS_MESSAGES      // Pre-defined success messages
} from "../constants/index.js";
```

## Checklist for New Features

- [ ] Create service class with business logic
- [ ] Create controller methods (thin, delegate to service)
- [ ] Create validators for input validation
- [ ] Add constants if needed (roles, statuses, messages)
- [ ] Use asyncHandler for all async controllers
- [ ] Use AppError for custom errors
- [ ] Use sendSuccess/sendCreated for responses
- [ ] Add routes with appropriate middleware
- [ ] Test error cases (throw AppError in service)
- [ ] Document in code comments

## Benefits Checklist

✅ **Single Responsibility**: Each file has one purpose
✅ **No Duplication**: Shared logic in services/utils
✅ **Consistent Errors**: All use AppError and errorMiddleware
✅ **Consistent Responses**: All use sendSuccess/sendCreated
✅ **No Magic Strings**: All use constants
✅ **Type Safety**: Constants prevent typos
✅ **Easy Testing**: Mock services in tests
✅ **Easy Maintenance**: Clear structure, easy to find code
✅ **Easy Extension**: Add new features without modifying existing

## Example: Complete Feature Implementation

```javascript
// 1. Add constants (if needed)
// constants/index.js
export const FEATURE_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive"
};

// 2. Create model
// models/Feature.js
import mongoose from "mongoose";
import { FEATURE_STATUS } from "../constants/index.js";

const featureSchema = new mongoose.Schema({
  name: { type: String, required: true },
  status: { 
    type: String, 
    enum: Object.values(FEATURE_STATUS),
    default: FEATURE_STATUS.ACTIVE 
  },
});

export default mongoose.model("Feature", featureSchema);

// 3. Create service
// services/featureService.js
import Feature from "../models/Feature.js";
import { AppError } from "../utils/errorHandler.js";
import { HTTP_STATUS, ERROR_MESSAGES } from "../constants/index.js";

class FeatureService {
  async createFeature(data) {
    const feature = await Feature.create(data);
    return feature;
  }

  async getFeatureById(id) {
    const feature = await Feature.findById(id);
    if (!feature) {
      throw new AppError(ERROR_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }
    return feature;
  }
}

export default new FeatureService();

// 4. Create validator
// validators/featureValidator.js
import { AppError } from "../utils/errorHandler.js";
import { HTTP_STATUS } from "../constants/index.js";

export const validateFeatureData = (req, res, next) => {
  if (!req.body.name) {
    throw new AppError("Feature name is required", HTTP_STATUS.BAD_REQUEST);
  }
  next();
};

// 5. Create controller
// controllers/featureController.js
import featureService from "../services/featureService.js";
import { asyncHandler } from "../utils/errorHandler.js";
import { sendSuccess, sendCreated } from "../utils/responseHandler.js";

export const createFeature = asyncHandler(async (req, res) => {
  const feature = await featureService.createFeature(req.body);
  sendCreated(res, feature, "Feature created successfully");
});

export const getFeature = asyncHandler(async (req, res) => {
  const feature = await featureService.getFeatureById(req.params.id);
  sendSuccess(res, feature);
});

// 6. Create routes
// routes/featureRoutes.js
import express from "express";
import { createFeature, getFeature } from "../controllers/featureController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { validateFeatureData } from "../validators/featureValidator.js";
import { asyncHandler } from "../utils/errorHandler.js";
import { USER_ROLES } from "../constants/index.js";

const router = express.Router();

router.post(
  "/",
  protect,
  authorize(USER_ROLES.ADMIN),
  asyncHandler(validateFeatureData),
  createFeature
);

router.get("/:id", protect, getFeature);

export default router;

// 7. Register in server.js
// server.js
import featureRoutes from "./routes/featureRoutes.js";
app.use("/api/features", featureRoutes);
```

---

## Remember

1. **Controllers**: Handle HTTP only
2. **Services**: Contain business logic
3. **Validators**: Validate inputs
4. **Constants**: No magic strings
5. **Errors**: Throw AppError in services
6. **Responses**: Use sendSuccess/sendCreated
7. **Async**: Always use asyncHandler

This keeps your code clean, maintainable, and following SOLID principles!
