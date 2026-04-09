import Store from "../models/Store.js";

export const createStore = async (req, res) => {
  try {
    const { name, description, location, phone } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Store name is required" });
    }

    const existingStore = await Store.findOne({ farmer: req.user.id });
    if (existingStore) {
      return res.status(400).json({ message: "Store already exists" });
    }

    const store = await Store.create({
      name,
      description,
      location,
      phone,
      farmer: req.user.id,
    });

    res.status(201).json(store);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
    console.error("Create store error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


export const getMyStore = async (req, res) => {
  try {
    const store = await Store.findOne({ farmer: req.user.id })
      .populate("products"); // <-- include all products in response

    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }

    res.json(store);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


// Update/edit store
export const updateStore = async (req, res) => {
  try {
    const { name, description, location, phone } = req.body;

    const store = await Store.findOne({ farmer: req.user.id });

    if (!store) {
      return res.status(404).json({ success: false, message: "Store not found" });
    }

    if (name) store.name = name;
    if (description) store.description = description;
    if (location) store.location = location;
    if (phone) store.phone = phone;

    const updatedStore = await store.save();

    res.status(200).json({ success: true, message: "Store updated successfully", store: updatedStore });
  } catch (err) {
    console.error("Update store error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};