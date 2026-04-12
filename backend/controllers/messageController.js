import Message from "../models/Message.js";
import asyncHandler from "../middleware/asyncHandler.js";

// SEND
export const sendMessage = asyncHandler(async (req, res) => {
  const senderId = req.user?.id;
  const { receiverId, messageText } = req.body || {};

  if (!senderId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!receiverId || !messageText || !String(messageText).trim()) {
    return res.status(400).json({ message: "receiverId and messageText are required" });
  }

  const message = await Message.create({
    senderId,
    receiverId,
    messageText: String(messageText).trim(),
  });
  res.status(201).json(message);
});

// GET CONVERSATION
export const getConversation = asyncHandler(async (req, res) => {
  const { senderId, receiverId } = req.query;

  const messages = await Message.find({
    $or: [
      { senderId, receiverId },
      { senderId: receiverId, receiverId: senderId }
    ]
  }).sort({ createdAt: 1 });

  res.json(messages);
});

// GET INBOX (all messages involving user)
export const getInbox = asyncHandler(async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const messages = await Message.find({
    $or: [{ senderId: userId }, { receiverId: userId }]
  })
    .populate("senderId", "name email")
    .populate("receiverId", "name email")
    .sort({ createdAt: -1 });

  res.json({ success: true, data: messages });
});

// EDIT
export const editMessage = asyncHandler(async (req, res) => {
  const message = await Message.findById(req.params.id);

  if (!message) {
    res.status(404);
    throw new Error("Message not found");
  }

  message.messageText = req.body.messageText;
  message.isEdited = true;

  const updated = await message.save();
  res.json(updated);
});