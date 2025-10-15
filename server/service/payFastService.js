const crypto = require("crypto");
const axios = require("axios");
const Payment = require("../models/payment");
const DeathReport = require("../models/deathReport");
const { sendPaymentNotification } = require("./notificationService");
const User = require("../models/user");
const Section = require("../models/section");
const ActivationPayment = require("../models/activationPayment");
const { default: mongoose } = require("mongoose");

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
  // 1. Filter out empty strings and the signature itself
  const filtered = Object.fromEntries(
    Object.entries(data).filter(([k, v]) => v !== "" && k !== "signature")
  );

  // 2. Sort keys alphabetically
  const sortedKeys = Object.keys(filtered).sort();

  // 3. Create parameter string
  const parameterString = sortedKeys
    .map((key) => `${key}=${encodeURIComponent(String(filtered[key]).trim())}`)
    .join("&");

  // 4. Add passphrase if exists
  const signatureString = PAYFAST_PASSPHRASE
    ? `${parameterString}&passphrase=${encodeURIComponent(PAYFAST_PASSPHRASE)}`
    : parameterString;

  // 5. Generate MD5 hash
  return crypto.createHash("md5").update(signatureString).digest("hex");
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
    notify_url: `${process.env.BACKEND_URL}/api/payments/itn`,
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
    console.log("handleInt triggered");
    // 1. Validate input
    if (!data.pf_payment_id || !data.payment_status || !data.amount_gross) {
      console.log("Invalid data - missing required fields:", {
        pf_payment_id: data.pf_payment_id,
        payment_status: data.payment_status,
        amount_gross: data.amount_gross,
      });
      throw new Error("Invalid data: Missing required PayFast fields");
    }

    const amount = parseFloat(data.amount_gross || data.amount);
    if (isNaN(amount) || amount <= 0) {
      console.error("Invalid amount received:", {
        amount_gross: data.amount_gross,
        amount: data.amount,
      });
      throw new Error(`Invalid payment amount: ${data.amount_gross}`);
    }

    // 2. Verify signature
    const generatedSignature = generateSignature(data);
    console.log("Signature Verification Debug:", {
      receivedSignature: data.signature,
      generatedSignature,
      dataUsedForSignature: Object.fromEntries(
        Object.entries(data)
          .filter(([k, v]) => v !== "" && k !== "signature")
          .sort()
      ),
    });

    // 3. Verify with PayFast
    const verificationResponse = await axios.post(PAYFAST_ITN_URL, data, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    if (verificationResponse.data !== "VALID") {
      throw new Error("PayFast verification failed");
    }

    // 4. Determine payment type
    const isActivationPayment = data.custom_str1 && !data.custom_int1;
    const paymentStatus = data.payment_status.toLowerCase();

    if (isActivationPayment) {
      // ============ ACTIVATION PAYMENT LOGIC ============
      const userId = new mongoose.Types.ObjectId(data.custom_str1);

      console.log(userId);
      const payment = await ActivationPayment.findOneAndUpdate(
        { reference: data.m_payment_id, user: userId },
        {
          status: paymentStatus,
          paymentData: data,
          completedAt: new Date(),
        },
        { new: true, session }
      );

      if (!payment) {
        throw new Error("Activation payment record not found");
      }

      if (paymentStatus === "complete") {
        await User.findByIdAndUpdate(
          userId,
          { isActive: true, status: "active" },
          { session }
        );
      }
    } else {
      // ============ FUNERAL CONTRIBUTION LOGIC ============
      const payment = await Payment.findOne({
        payfastPaymentId: data.m_payment_id,
      }).populate("user deathReport");

      if (!payment) {
        throw new Error("Payment record not found");
      }

      payment.status = paymentStatus;
      payment.paymentData = data;
      payment.completedAt = new Date();
      await payment.save({ session });

      if (paymentStatus === "complete") {
        // ... (keep your existing funeral contribution logic)
        const userId = payment.user._id;
        const report = await DeathReport.findById(payment.deathReport).populate(
          "contributions.member"
        );

        // ... rest of your funeral contribution logic
      }
    }

    await session.commitTransaction();
    return { success: true };
  } catch (error) {
    await session.abortTransaction();
    console.error("ITN handling error:", error);
    throw error;
  } finally {
    session.endSession();
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
