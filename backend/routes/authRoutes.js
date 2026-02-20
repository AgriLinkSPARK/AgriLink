import express from "express";
import protect from "../middleware/authMiddleware.js";
import authorize from "../middleware/roleMiddleware.js";
import { register, login } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.get(
  "/admin-dashboard",
  protect,
  authorize("admin"),
  (req, res) => {
    res.json({ message: "Admin dashboard" });
  }
);


router.get(
  "/farmer-dashboard",
  protect,
  authorize("farmer"),
  (req, res) => {
    res.json({ message: "Farmer dashboard" });
  }
);


export default router;
