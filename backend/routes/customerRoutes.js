import express from "express";
<<<<<<< Updated upstream
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

=======
import { registerCustomer, loginCustomer, customerDashboard } from "../controllers/customerController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router(); // create router instance

// Customer registration & login
>>>>>>> Stashed changes
router.post("/register", registerCustomer);
router.post("/login", loginCustomer);

// Customer Dashboard (protected)
router.get("/dashboard", protect, customerDashboard);

<<<<<<< Updated upstream
// Customer Profile CRUD (protected + role)
router.get("/profile", protect, authorize("customer"), getCustomerProfile);
router.put("/profile", protect, authorize("customer"), updateCustomerProfile);
router.delete("/profile", protect, authorize("customer"), deleteCustomerProfile);

export default router;
=======
export default router; // default export
>>>>>>> Stashed changes
