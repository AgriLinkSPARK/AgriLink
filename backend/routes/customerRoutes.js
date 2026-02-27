// import express from "express";
// import { registerCustomer, loginCustomer, customerDashboard } from "../controllers/customerController.js";
// import { protect, authorize } from "../middleware/authMiddleware.js";

// const router = express.Router(); // create router instance

// // Customer registration & login
// router.post("/register", registerCustomer);
// router.post("/login", loginCustomer);
import express from "express";
import { registerCustomer, loginCustomer, customerDashboard, getCustomerProfile, updateCustomerProfile, deleteCustomerProfile, getAllStores  } from "../controllers/customerController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router(); // create router instance

// Customer registration & login
router.post("/register", registerCustomer);
router.post("/login", loginCustomer);

// Customer Dashboard (protected)
router.get("/dashboard", protect, authorize("customer"), customerDashboard);

// Profile (protected)
router.get("/profile", protect, authorize("customer"), getCustomerProfile);
router.put("/profile", protect, authorize("customer"), updateCustomerProfile);
router.delete("/profile", protect, authorize("customer"), deleteCustomerProfile);

router.get("/stores", protect, authorize('customer'), getAllStores);

export default router; // default export
