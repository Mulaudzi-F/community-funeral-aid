const mongoose = require("mongoose");

const BeneficiarySchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  idNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  dob: {
    type: Date,
    required: true,
  },
  relationship: {
    type: String,
    enum: ["child", "spouse"],
    required: true,
  },
  accountHolder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Age validation middleware
BeneficiarySchema.pre("save", function (next) {
  const age = calculateAge(this.dob);
  if (age > 23) {
    throw new Error("Beneficiary must be under 23 years old");
  }
  next();
});

function calculateAge(birthdate) {
  const diff = Date.now() - birthdate.getTime();
  const ageDate = new Date(diff);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}

module.exports = mongoose.model("Beneficiary", BeneficiarySchema);
