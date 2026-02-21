import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "Orders API working" });
});

router.post("/", (req, res) => {
  res.json({
    message: "Order created",
    data: req.body
  });
});

export default router;
