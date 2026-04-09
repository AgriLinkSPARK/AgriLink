import mongoose from "mongoose";
import Logistics from "../models/logistics.js";
import asyncHandler from "../middleware/asyncHandler.js";
import whatsappService from "../services/whatsappService.js";

const getLogisticsNotificationPhone = (logistics) => logistics?.customerPhone || logistics?.recipientPhone;

const sendLogisticsCreateNotification = async (logistics) => {
  const phone = getLogisticsNotificationPhone(logistics);
  if (!phone) {
    return { attempted: false, sent: false, reason: "No customerPhone/recipientPhone on logistics record" };
  }

  const message = `AgriLink logistics created for order ${logistics.orderId}. Status: ${logistics.status}. Delivery location: ${logistics.deliveryLocation}.`;
  const result = await whatsappService.sendMessage(phone, message);
  return { attempted: true, sent: true, ...result };
};

const sendLogisticsStatusNotification = async (logistics, oldStatus) => {
  const phone = getLogisticsNotificationPhone(logistics);
  if (!phone) {
    return { attempted: false, sent: false, reason: "No customerPhone/recipientPhone on logistics record" };
  }

  const contentSid = process.env.TWILIO_WHATSAPP_CONTENT_SID;

  if (contentSid) {
    const templateVariables = {
      1: oldStatus,
      2: logistics.status
    };

    const result = await whatsappService.sendTemplateMessage(phone, contentSid, templateVariables);
    return { attempted: true, sent: true, mode: "template", ...result };
  }

  const message = `AgriLink update: your logistics status changed from ${oldStatus} to ${logistics.status}.`;
  const result = await whatsappService.sendMessage(phone, message);
  return { attempted: true, sent: true, mode: "text", ...result };
};

const sendLogisticsDeleteNotification = async (logistics) => {
  const phone = getLogisticsNotificationPhone(logistics);
  if (!phone) {
    return { attempted: false, sent: false, reason: "No customerPhone/recipientPhone on logistics record" };
  }

  const message = `AgriLink: Logistics record for order ${logistics.orderId} has been cancelled. Status was: ${logistics.status}.`;
  const result = await whatsappService.sendMessage(phone, message);
  return { attempted: true, sent: true, ...result };
};

// CREATE
export const createLogistics = asyncHandler(async (req, res) => {
  let payload = { ...req.body };

  // Auto-populate customerPhone from Order buyer if not provided
  if (payload.orderId && !payload.customerPhone) {
    try {
      const Order = (await import("../models/order.js")).default;
      const order = await Order.findById(payload.orderId).populate("buyerId", "phone");
      if (order?.buyerId?.phone) {
        payload.customerPhone = order.buyerId.phone;
        console.log(`ℹ️ Auto-populated customerPhone from Order buyer: ${order.buyerId.phone}`);
      }
    } catch (error) {
      console.error("Could not fetch customerPhone from Order:", error.message);
    }
  }

  const logistics = await Logistics.create(payload);
  let whatsappNotification = { attempted: false, sent: false };

  try {
    whatsappNotification = await sendLogisticsCreateNotification(logistics);
  } catch (error) {
    console.error("WhatsApp notification failed on logistics create:", error.message);
    whatsappNotification = {
      attempted: true,
      sent: false,
      error: error.message
    };
  }

  if (whatsappNotification?.sent) {
    console.log(
      `✅ WhatsApp sent (Logistics CREATE) | SID: ${whatsappNotification.sid} | To: ${whatsappNotification.to} | Status: ${whatsappNotification.status}`
    );
  } else {
    console.log(
      `ℹ️ WhatsApp not sent (Logistics CREATE) | Reason: ${whatsappNotification?.reason || whatsappNotification?.error || "Unknown"}`
    );
  }

  res.status(201).json({
    success: true,
    message: "Logistics record created successfully",
    data: logistics,
    whatsappNotification
  });
});

// GET BY ORDER ID (for customers)
export const getLogisticsByOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  console.log(`[Backend Track] Received orderId: ${orderId}`);

  // Convert string orderId to ObjectId for MongoDB query
  let orderObjectId;
  try {
    orderObjectId = new mongoose.Types.ObjectId(orderId);
    console.log(`[Backend Track] Converted to ObjectId: ${orderObjectId}`);
  } catch (error) {
    console.log(`[Backend Track] Invalid ObjectId format: ${error.message}`);
    res.status(400);
    throw new Error("Invalid Order ID format. Please try again.");
  }

  const logistics = await Logistics.findOne({ orderId: orderObjectId })
    .populate("orderId", "_id items totalAmount paymentStatus")
    .sort({ createdAt: -1 });

  console.log(`[Backend Track] Query result: ${logistics ? 'found' : 'not found'}`);

  if (!logistics) {
    // Try to find by string orderId as fallback
    const logisticsByString = await Logistics.findOne({ orderId: orderId });
    console.log(`[Backend Track] Fallback string query result: ${logisticsByString ? 'found' : 'not found'}`);

    res.status(404);
    throw new Error("Invalid Order ID. Please try again.");
  }

  res.json({
    success: true,
    message: "Delivery details retrieved successfully",
    data: logistics
  });
});

// GET ALL (with filtering + pagination)
export const getLogistics = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;

  let query = {};

  if (status) {
    query.status = status;
  }

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  // Get total count for pagination
  const totalRecords = await Logistics.countDocuments(query);
  const totalPages = Math.ceil(totalRecords / limitNum);

  const logistics = await Logistics.find(query)
    .populate("orderId")
    .limit(limitNum)
    .skip((pageNum - 1) * limitNum)
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    message: "Logistics records retrieved successfully",
    pagination: {
      currentPage: pageNum,
      totalPages,
      totalRecords,
      recordsPerPage: limitNum,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1
    },
    filters: {
      status: status || "all"
    },
    data: logistics
  });
});

// UPDATE STATUS
export const updateLogistics = asyncHandler(async (req, res) => {
  const logistics = await Logistics.findById(req.params.id);

  if (!logistics) {
    res.status(404);
    throw new Error("Logistics not found");
  }

  const oldStatus = logistics.status;
  const shouldNotify = req.body.notify !== false; // default to true if not specified
  logistics.status = req.body.status || logistics.status;

  if (req.body.status === "Delivered") {
    logistics.actualDeliveryDate = new Date();
  }

  const updated = await logistics.save();
  let whatsappNotification = { attempted: false, sent: false, reason: "Status unchanged" };

  if (oldStatus !== updated.status && shouldNotify) {
    try {
      whatsappNotification = await sendLogisticsStatusNotification(updated, oldStatus);
    } catch (error) {
      console.error("WhatsApp notification failed on logistics status update:", error.message);
      whatsappNotification = {
        attempted: true,
        sent: false,
        error: error.message
      };
    }
  } else if (oldStatus === updated.status) {
    whatsappNotification = { attempted: false, sent: false, reason: "Status unchanged" };
  } else if (!shouldNotify) {
    whatsappNotification = { attempted: false, sent: false, reason: "Notification disabled by user" };
    console.log(`ℹ️ WhatsApp skipped (Logistics STATUS) | notify=false set by user`);
  }

  if (whatsappNotification?.sent) {
    console.log(
      `✅ WhatsApp sent (Logistics STATUS) | SID: ${whatsappNotification.sid} | To: ${whatsappNotification.to} | ${oldStatus} -> ${updated.status}`
    );
  } else {
    console.log(
      `ℹ️ WhatsApp not sent (Logistics STATUS) | Reason: ${whatsappNotification?.reason || whatsappNotification?.error || "Unknown"}`
    );
  }
  
  res.json({
    success: true,
    message: `Logistics status updated from "${oldStatus}" to "${updated.status}"`,
    data: updated,
    whatsappNotification
  });
});

// DELETE
export const deleteLogistics = asyncHandler(async (req, res) => {
  const logistics = await Logistics.findById(req.params.id);

  if (!logistics) {
    res.status(404);
    throw new Error("Logistics not found");
  }

  let whatsappNotification = { attempted: false, sent: false };

  try {
    whatsappNotification = await sendLogisticsDeleteNotification(logistics);
  } catch (error) {
    console.error("WhatsApp notification failed on logistics delete:", error.message);
    whatsappNotification = {
      attempted: true,
      sent: false,
      error: error.message
    };
  }

  await logistics.deleteOne();

  if (whatsappNotification?.sent) {
    console.log(
      `✅ WhatsApp sent (Logistics DELETE) | SID: ${whatsappNotification.sid} | To: ${whatsappNotification.to} | Status was: ${logistics.status}`
    );
  } else {
    console.log(
      `ℹ️ WhatsApp not sent (Logistics DELETE) | Reason: ${whatsappNotification?.reason || whatsappNotification?.error || "Unknown"}`
    );
  }
  
  res.json({
    success: true,
    message: "Logistics record cancelled successfully",
    data: {
      deletedId: req.params.id,
      deletedStatus: logistics.status
    },
    whatsappNotification
  });
});
