const mongoose = require("mongoose");

const DeathReportSchema = new mongoose.Schema({
  deceased: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Beneficiary",
    required: true,
    unique: true,
  },
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  deathCertificate: {
    type: String, // URL to document
    required: true,
  },
  bankDetails: {
    accountHolder: {
      type: String,
      required: true,
    },
    accountNumber: {
      type: String,
      required: true,
    },
    bankName: {
      type: String,
      required: true,
    },
    branchCode: {
      type: String,
      required: true,
    },
    accountType: {
      type: String,
      enum: ["savings", "cheque", "transmission"],
      required: true,
    },
  },
  status: {
    type: String,
    enum: ["pending", "under-review", "approved", "rejected", "paid"],
    default: "pending",
  },
  votes: [
    {
      voter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      approved: {
        type: Boolean,
        required: true,
      },
      comment: String,
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  adminApproved: {
    type: Boolean,
    default: false,
  },
  verificationData: {
    type: Object,
  },
  payoutAmount: {
    type: Number,
    default: 20,
  },
  payoutDate: Date,
  payoutDeadline: {
    type: Date,
    default: function () {
      return new Date(Date.now() + 48 * 60 * 60 * 1000);
    },
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Set 24-hour deadline when report is created
DeathReportSchema.pre("save", function (next) {
  if (this.isNew) {
    this.payoutDate = new Date(Date.now() + 36 * 60 * 60 * 1000);
    this.deadline = new Date(Date.now() + 24 * 60 * 60 * 1000);
  }
  next();
});

module.exports = mongoose.model("DeathReport", DeathReportSchema);
