import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { addToCart, getCart, updateCartItem, removeFromCart } from "../controllers/cartController.js";

const router = express.Router();

router.post("/add", protect, addToCart);
router.get("/", protect, getCart);
router.put("/update/:productId", protect, updateCartItem);
router.delete("/remove/:productId", protect, removeFromCart);

export default router;