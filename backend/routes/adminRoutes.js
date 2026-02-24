import express from "express";
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
import protect from "../middleware/authMiddleware.js";
=======
import { protect } from "../middleware/authMiddleware.js";
>>>>>>> Stashed changes
=======
import { protect } from "../middleware/authMiddleware.js";
>>>>>>> Stashed changes
=======
import { protect } from "../middleware/authMiddleware.js";
>>>>>>> Stashed changes
=======
import { protect } from "../middleware/authMiddleware.js";
>>>>>>> Stashed changes
=======
import { protect } from "../middleware/authMiddleware.js";
>>>>>>> Stashed changes
import authorize from "../middleware/roleMiddleware.js";
import { createFarmer } from "../controllers/adminController.js";

const router = express.Router();

// Admin-only route to create farmers
router.post("/create-farmer", protect, authorize("admin"), createFarmer);

export default router;