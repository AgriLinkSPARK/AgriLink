import express from "express";
import {
  sendMessage,
  getConversation,
  editMessage
} from "../controllers/messageController.js";

const router = express.Router();

// Send a message
router.post("/", sendMessage);

// Get messages between two users
router.get("/", getConversation);

// Edit a message
router.put("/:id", editMessage);

// Delete a message
router.delete("/:id", async (req, res) => {
    const message = await Message.findById(req.params.id);
    if (!message) {
        res.status(404);
        throw new Error("Message not found");
    }
    await message.deleteOne();
    res.json({ message: "Message deleted successfully" });
});

export default router;