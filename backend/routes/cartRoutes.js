import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { addToCart, getCart, updateCartItem, removeFromCart } from "../controllers/cartController.js";

const router = express.Router();

router.post("/add", protect, authorize("customer"), addToCart);
router.get("/", protect, authorize("customer"), getCart);
router.put("/update/:productId", protect, authorize("customer"), updateCartItem);
router.delete("/remove/:productId", protect, authorize("customer"), removeFromCart);

export default router;