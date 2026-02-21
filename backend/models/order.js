const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    buyerName: String,
    items: String,
    totalAmount: Number,
    status: {
        type: String,
        default: "Pending"
    }
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);
