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
    enum: ["AccountHolder", "child", "spouse"],
    required: true,
  },
  isPrimary: {
    type: Boolean,
    default: false,
  },
  accountHolder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  isAlive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Age validation middleware
BeneficiarySchema.pre("save", function (next) {
  const age = calculateAge(this.dob);
  if (this.relationship === "child" && age > 25) {
    throw new Error("Beneficiary must be under 25 years old");
  }

  if (this.relationship === "spouse") {
    mongoose
      .model("Beneficiary")
      .countDocuments({
        accountHolder: this.accountHolder,
        relationship: "spouse",
      })
      .then((count) => {
        if (count > 0) {
          throw new Error(
            "Account holder can only have one spouse beneficiary"
          );
        }
        next();
      })
      .catch(next);
  } else {
    next();
  }

  if (this.relationship === "AccountHolder") {
    this.isPrimary = true;
  }

  next();
});

function calculateAge(birthdate) {
  const diff = Date.now() - birthdate.getTime();
  const ageDate = new Date(diff);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}

module.exports = mongoose.model("Beneficiary", BeneficiarySchema);
