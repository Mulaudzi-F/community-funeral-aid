const crypto = require("crypto");
const axios = require("axios");
const Payment = require("../models/payment");
const DeathReport = require("../models/deathReport");
const { sendPaymentNotification } = require("./notificationService");
const User = require("../models/user");
const Section = require("../models/section");

const PAYFAST_MERCHANT_ID = process.env.PAYFAST_MERCHANT_ID;
const PAYFAST_MERCHANT_KEY = process.env.PAYFAST_MERCHANT_KEY;
const PAYFAST_PASSPHRASE = process.env.PAYFAST_PASSPHRASE;
const PAYFAST_URL =
  process.env.PAYFAST_ENV === "production"
    ? "https://www.payfast.co.za/eng/process"
    : "https://sandbox.payfast.co.za/eng/process";
const PAYFAST_ITN_URL =
  process.env.PAYFAST_ENV === "production"
    ? "https://www.payfast.co.za/eng/query/validate"
    : "https://sandbox.payfast.co.za/eng/query/validate";

function generateNumericHash(input) {
  const inputString = String(input);
  const hash = crypto.createHash("md5").update(inputString).digest("hex");
  // Convert the first 8 characters of the hash to a number
  return parseInt(hash.substring(0, 8), 16);
}

// Generate PayFast signature
function generateSignature(data) {
  // 1. Sort the keys alphabetically
  const sortedKeys = Object.keys(data).sort();

  // 2. Build the signature string
  const signatureString = sortedKeys
    .map((key) => `${key}=${encodeURIComponent(String(data[key]).trim())}`)
    .join("&");

  const fullSignatureString = PAYFAST_PASSPHRASE
    ? `${signatureString}&passphrase=${encodeURIComponent(PAYFAST_PASSPHRASE)}`
    : signatureString;

  // 4. Generate MD5 hash
  return crypto.createHash("md5").update(fullSignatureString).digest("hex");
}

// Initiate a funeral contribution payment
exports.initiateFuneralContribution = async (userId, deathReportId) => {
  try {
    const deathReport = await DeathReport.findById(deathReportId)
      .populate("reporter", "firstName lastName email phone")
      .populate("deceased");

    if (!deathReport) {
      throw new Error("Death report not found");
    }

    const paymentData = {
      merchant_id: PAYFAST_MERCHANT_ID,
      merchant_key: PAYFAST_MERCHANT_KEY,
      return_url: `${process.env.FRONTEND_URL}/login`,
      cancel_url: "https://sandbox.payfast.co.za/cancel",
      notify_url: "https://sandbox.payfast.co.za/notify",
      // return_url: `${process.env.FRONTEND_URL}/payments/success`,
      // cancel_url: `${process.env.FRONTEND_URL}/payments/cancel`,
      // notify_url: `${process.env.BACKEND_URL}/api/payments/itn`,
      name_first: deathReport.reporter.firstName,
      name_last: deathReport.reporter.lastName,
      email_address: deathReport.reporter.email,
      cell_number: deathReport.reporter.phone,
      m_payment_id: `funeral-${Date.now()}`,
      amount: "20.00", // Fixed ZAR 20 contribution
      item_name: `Funeral Contribution for ${deathReport.deceased.firstName} ${deathReport.deceased.lastName}`,
      item_description: "Community funeral aid contribution payment",
      custom_int1: `${generateNumericHash(userId)}`,
      custom_str1: `${generateNumericHash(deathReportId)}`,
    };

    // Create payment record
    const payment = await Payment.create({
      user: userId,
      deathReport: deathReportId,
      amount: 20.0,
      payfastPaymentId: paymentData.m_payment_id,
      status: "pending",
    });

    return {
      paymentId: payment._id,
      paymentUrl: `${PAYFAST_URL}?${new URLSearchParams(
        paymentData
      ).toString()}`,
      paymentData,
    };
  } catch (error) {
    console.error("PayFast initiation error:", error);
    throw error;
  }
};

// Process payment with PayFast
// This function is used to generate the payment URL for PayFast when actiating user account
exports.processPayment = async (paymentData) => {
  const baseData = {
    merchant_id: PAYFAST_MERCHANT_ID,
    merchant_key: PAYFAST_MERCHANT_KEY,
    return_url: `${process.env.FRONTEND_URL}/login`,
    cancel_url: "https://sandbox.payfast.co.za/cancel",
    notify_url: `${process.env.BACKEND_URL}/api/payments/webhook`,
    email_address: paymentData.email || "",
    amount: paymentData.amount.toString(),
    item_name: paymentData.item_name,
    item_description: paymentData.item_description || "",
    m_payment_id: `${generateNumericHash(paymentData.m_payment_id)}`,
    custom_str1: `${generateNumericHash(paymentData.custom_str1 || "")}`,
  };

  //baseData.signature = generateSignature(baseData);

  return `${PAYFAST_URL}?${new URLSearchParams(baseData).toString()}`;
};

// Verify PayFast payment
exports.verifyPayFastPayment = async (data) => {
  try {
    const response = await axios.post(PAYFAST_ITN_URL, data, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    return response.data === "VALID";
  } catch (error) {
    console.error("PayFast verification error:", error);
    return false;
  }
};

// Handle PayFast ITN (Instant Transaction Notification)
exports.handleITN = async (data) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Validate input
    if (!data.m_payment_id || !data.payment_status || !data.amount) {
      throw new Error("Invalid data received from PayFast");
    }
    if (isNaN(data.amount) || data.amount <= 0) {
      throw new Error("Invalid payment amount");
    }

    // Verify the signature
    const signature = generateSignature(data);
    if (signature !== data.signature) {
      throw new Error("Invalid signature");
    }

    // Verify the payment with PayFast
    const verificationResponse = await axios.post(PAYFAST_ITN_URL, data, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    if (verificationResponse.data !== "VALID") {
      throw new Error("PayFast verification failed");
    }

    // Find the payment record
    const payment = await Payment.findOne({
      payfastPaymentId: data.m_payment_id,
    }).populate("user deathReport");

    if (!payment) {
      throw new Error("Payment record not found");
    }

    // Update payment status
    let status;
    switch (data.payment_status) {
      case "COMPLETE":
        status = "completed";
        break;
      case "FAILED":
        status = "failed";
        break;
      case "CANCELLED":
        status = "cancelled";
        break;
      default:
        status = "pending";
    }

    payment.status = status;
    payment.paymentData = data;
    payment.completedAt = new Date();
    await payment.save({ session });

    if (status === "completed") {
      const userId = payment.user._id;
      const report = await DeathReport.findById(payment.deathReport).populate(
        "contributions.member"
      );

      if (!report) {
        throw new Error("Death report not found");
      }

      const user = await User.findById(userId).select("section");
      if (!user.section) {
        throw new Error("User not in a section");
      }

      const section = await Section.findById(user.section).populate(
        "community",
        "contributionAmount adminFeePercentage"
      );

      const now = new Date();
      const isLate = now > report.payoutDeadline;
      const contributionAmount = section.community.contributionAmount;
      const adminFee = data.amount - contributionAmount;

      await DeathReport.updateOne(
        { _id: report._id, "contributions.member": userId },
        {
          $set: {
            "contributions.$.status": isLate ? "late" : "paid",
            "contributions.$.paidAt": now,
            "contributions.$.amount": contributionAmount,
          },
        },
        { upsert: true, session }
      );

      section.currentBalance += contributionAmount;
      section.totalContributions += contributionAmount;
      section.community.currentBalance += adminFee;

      await Promise.all([
        section.save({ session }),
        section.community.save({ session }),
      ]);

      await User.findByIdAndUpdate(
        userId,
        {
          lastPaymentDate: now,
          $inc: { strikes: -1 },
        },
        { session }
      );

      try {
        await sendPaymentNotification(
          payment.user,
          payment.deathReport,
          contributionAmount
        );
      } catch (error) {
        console.error("Failed to send payment notification:", error);
      }
    }

    await session.commitTransaction();
    session.endSession();

    return { success: true, payment };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("ITN handling error:", error);
    throw error;
  }
};

// Get user payment history
exports.getUserPaymentHistory = async (userId, limit = 20) => {
  return Payment.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("deathReport", "deceased status")
    .populate({
      path: "deathReport",
      populate: {
        path: "deceased",
        select: "firstName lastName",
      },
    });
};
