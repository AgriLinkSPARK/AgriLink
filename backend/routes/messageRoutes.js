import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import {
  sendMessage,
  getConversation,
  editMessage
} from "../controllers/messageController.js";

const router = express.Router();

// Send a message (customer and farmer can message)
router.post("/", protect, authorize("customer", "farmer"), sendMessage);

// Get messages between two users
router.get("/", protect, authorize("customer", "farmer"), getConversation);

// Edit a message
router.put("/:id", protect, authorize("customer", "farmer"), editMessage);

// Delete a message
router.delete("/:id", protect, authorize("customer", "farmer"), async (req, res) => {
    const message = await Message.findById(req.params.id);
    if (!message) {
        res.status(404);
        throw new Error("Message not found");
    }
    await message.deleteOne();
    res.json({ message: "Message deleted successfully" });
});

export default router;