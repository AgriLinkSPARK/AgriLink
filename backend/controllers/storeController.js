import Store from "../models/Store.js";

export const createStore = async (req, res) => {
  try {
    const { name, description, location, phone } = req.body;

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