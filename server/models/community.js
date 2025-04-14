const mongoose = require("mongoose");

const CommunitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: String,
    registrationFee: {
      type: Number,
      default: 18,
      min: 18,
    },
    contributionAmount: {
      type: Number,
      default: 15,
      min: 0,
    },
    adminFeePercentage: {
      type: Number,
      default: 20,
      min: 0,
      max: 100,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: Date,
    sections: [],
  },

  { timestamps: true }
);

module.exports = mongoose.model("Community", CommunitySchema);
