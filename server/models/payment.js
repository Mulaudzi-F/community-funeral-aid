const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  deathReport: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DeathReport",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  payfastPaymentId: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "completed", "failed", "cancelled"],
    default: "pending",
  },
  paymentData: {
    type: Object,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: {
    type: Date,
  },
});

module.exports =
  mongoose.models.Payment || mongoose.model("Payment", PaymentSchema);
