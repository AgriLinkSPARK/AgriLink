import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "Payments API working" });
});

router.post("/", (req, res) => {
  res.json({
    message: "Payment created",
    data: req.body
  });
});

export default router;
