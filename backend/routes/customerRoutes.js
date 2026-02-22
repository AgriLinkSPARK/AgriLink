import express from "express";
import {
	registerCustomer,
	loginCustomer,
	customerDashboard,
	getCustomerProfile,
	updateCustomerProfile,
	deleteCustomerProfile,
} from "../controllers/customerController.js";
import protect from "../middleware/authMiddleware.js";
import authorize from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/register", registerCustomer);
router.post("/login", loginCustomer);

// Customer Dashboard (protected)
router.get("/dashboard", protect, customerDashboard);

// Customer Profile CRUD (protected + role)
router.get("/profile", protect, authorize("customer"), getCustomerProfile);
router.put("/profile", protect, authorize("customer"), updateCustomerProfile);
router.delete("/profile", protect, authorize("customer"), deleteCustomerProfile);

export default router;