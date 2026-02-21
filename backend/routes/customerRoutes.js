import express from "express";
import { 
  registerCustomer, loginCustomer, getProfile, 
  updateProfile, addAddress, getOrderHistory, deleteAccount 
} from "../controllers/customerController.js";
import protect from "../middleware/authMiddleware.js";
import authorize from "../middleware/roleMiddleware.js";

const router = express.Router();

// Public
router.post("/register", registerCustomer);
router.post("/login", loginCustomer);

// Protected (Private)
router.get("/profile", protect, authorize("customer"), getProfile);
router.put("/update", protect, authorize("customer"), updateProfile);
router.post("/address", protect, authorize("customer"), addAddress);
router.get("/orders", protect, authorize("customer"), getOrderHistory);
router.delete("/delete", protect, authorize("customer"), deleteAccount);

export default router;