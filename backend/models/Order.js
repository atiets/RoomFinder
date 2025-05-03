const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    orderCode: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ["PENDING", "PAID"], default: "PENDING" },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
