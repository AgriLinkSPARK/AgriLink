// import express from "express";
// import { registerCustomer, loginCustomer, customerDashboard } from "../controllers/customerController.js";
// import { protect, authorize } from "../middleware/authMiddleware.js";

// const router = express.Router(); // create router instance

// // Customer registration & login
// router.post("/register", registerCustomer);
// router.post("/login", loginCustomer);
import express from "express";
import { registerCustomer, loginCustomer, customerDashboard, getCustomerProfile, updateCustomerProfile, deleteCustomerProfile } from "../controllers/customerController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router(); // create router instance

// Customer registration & login
router.post("/register", registerCustomer);
router.post("/login", loginCustomer);

// // Customer Dashboard (protected)
// router.get("/dashboard", protect, customerDashboard);

// export default router; // default export
// Profile (protected)
router.get("/profile", protect, getCustomerProfile);
router.put("/profile", protect, updateCustomerProfile);
router.delete("/profile", protect, deleteCustomerProfile);

export default router; // default export
