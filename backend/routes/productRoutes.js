// routes/productRoutes.js
import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { createProduct, getProducts, updateProduct, deleteProduct } from "../controllers/productController.js";
import { upload } from "../config/multerCloudinary.js";

const router = express.Router();

// Only farmers can manage their products
router.post(
  "/",
  protect,
  authorize("farmer"),
  upload.fields([
    { name: "mainImage", maxCount: 1 },
    { name: "extraImages", maxCount: 5 }
  ]),
  createProduct
);

router.get("/", protect, authorize("farmer"), getProducts);

router.put(
  "/:id",
  protect,
  authorize("farmer"),
  upload.fields([
    { name: "mainImage", maxCount: 1 },
    { name: "extraImages", maxCount: 5 }
  ]),
  updateProduct
);

router.delete("/:id", protect, authorize("farmer"), deleteProduct);

export default router;