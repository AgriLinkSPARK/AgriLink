import express from "express";
import { login } from "../controllers/authController.js";

const router = express.Router();

// Admin/Farmer login
router.post("/login", login);

export default router;