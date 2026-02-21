const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
    orderId: String,
    amount: Number,
    method: String,
    status: {
        type: String,
        default: "Paid"
    }
});

module.exports = mongoose.model("Payment", paymentSchema);
