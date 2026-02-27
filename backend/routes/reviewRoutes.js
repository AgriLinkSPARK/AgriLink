import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import {
  createReview,
  getAllReviews,
  getReviewById,
  updateReview,
  deleteReview
} from "../controllers/reviewController.js";

const router = express.Router();

// Routes
router.post("/", protect, authorize("customer"), createReview);
router.get("/", protect, authorize("customer"), getAllReviews);
router.get("/:id", protect, authorize("customer"), getReviewById);
router.put("/:id", protect, authorize("customer"), updateReview);
router.delete("/:id", protect, authorize("customer"), deleteReview);

export default router;