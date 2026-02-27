import Message from "../models/Message.js";
import asyncHandler from "../middleware/asyncHandler.js";

// SEND
export const sendMessage = asyncHandler(async (req, res) => {
  const message = await Message.create(req.body);
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