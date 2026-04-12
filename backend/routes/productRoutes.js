// routes/productRoutes.js
import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { 
  createProduct, 
  getProducts, 
  getAllProducts, 
  updateProduct, 
  deleteProduct, 
  getProductById, 
  getPublicProductById,
  searchProducts 
} from "../controllers/productController.js";
import { upload } from "../config/multerCloudinary.js";

const router = express.Router();

// ── Customer-facing: browse all in-stock products (any authenticated role) ──
router.get("/all", protect, getAllProducts);
router.get("/details/:id", protect, getPublicProductById);

// ── Only farmers can manage their products ──
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

router.get("/search", protect, authorize("farmer"), searchProducts);
router.get("/:id", protect, authorize("farmer"), getProductById);
router.delete("/:id", protect, authorize("farmer"), deleteProduct);

export default router;