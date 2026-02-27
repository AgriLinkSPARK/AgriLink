import Logistics from "../models/logistics.js";
import asyncHandler from "../middleware/asyncHandler.js";

// CREATE
export const createLogistics = asyncHandler(async (req, res) => {
  const logistics = await Logistics.create(req.body);
  res.status(201).json(logistics);
});

// GET ALL (with filtering + pagination)
export const getLogistics = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;

  let query = {};

  if (status) {
    query.status = status;
  }

  const logistics = await Logistics.find(query)
    .populate("orderId")
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  res.json(logistics);
});

// UPDATE STATUS
export const updateLogistics = asyncHandler(async (req, res) => {
  const logistics = await Logistics.findById(req.params.id);

  if (!logistics) {
    res.status(404);
    throw new Error("Logistics not found");
  }

  logistics.status = req.body.status || logistics.status;

  if (req.body.status === "Delivered") {
    logistics.actualDeliveryDate = new Date();
  }

  const updated = await logistics.save();
  res.json(updated);
});

// DELETE
export const deleteLogistics = asyncHandler(async (req, res) => {
  const logistics = await Logistics.findById(req.params.id);

  if (!logistics) {
    res.status(404);
    throw new Error("Logistics not found");
  }

  await logistics.deleteOne();
  res.json({ message: "Logistics cancelled successfully" });
});