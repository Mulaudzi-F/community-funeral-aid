const { default: mongoose } = require("mongoose");

// models/ActivationPayment.js
const ActivationPaymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    reference: {
      type: String,
      required: true,
    },
    purpose: String,
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const ActivationPayment = mongoose.model(
  "ActivationPayment",
  ActivationPaymentSchema
);

module.exports = ActivationPayment;
