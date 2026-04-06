import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import authorize from "../middleware/roleMiddleware.js";
import {
  createUser,
  createFarmer,
  getAllUsers,
  getUserById,
  updateUser,
  updateUserPassword,
  deleteUser,
  getUsersByCategory,
} from "../controllers/adminController.js";

const router = express.Router();

// ==========================
// User Management Routes
// ==========================

// Create any user (farmer/customer)
router.post("/users", protect, authorize("admin"), createUser);

// Create farmer (legacy endpoint)
router.post("/create-farmer", protect, authorize("admin"), createFarmer);

// Get all users with optional role filter
// ?role=farmer or ?role=customer or ?role=admin
router.get("/users", protect, authorize("admin"), getAllUsers);

// Get users by category/role
// /admin/users/category/farmer
router.get("/users/category/:category", protect, authorize("admin"), getUsersByCategory);

// Get user by ID
router.get("/users/:userId", protect, authorize("admin"), getUserById);

// Update/Edit user
router.put("/users/:userId", protect, authorize("admin"), updateUser);

// Update user password
router.put("/users/:userId/password", protect, authorize("admin"), updateUserPassword);

// Delete user
router.delete("/users/:userId", protect, authorize("admin"), deleteUser);

export default router;