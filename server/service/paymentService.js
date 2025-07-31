// const axios = require("axios");
// const crypto = require("crypto");
// const User = require("../models/user");
// const { sendEmail } = require("./notificationService");

// // PayFast integration
// const PAYFAST_MERCHANT_ID = process.env.PAYFAST_MERCHANT_ID;
// const PAYFAST_MERCHANT_KEY = process.env.PAYFAST_MERCHANT_KEY;
// const PAYFAST_PASSPHRASE = process.env.PAYFAST_PASSPHRASE;
// const PAYFAST_URL =
//   process.env.PAYFAST_URL || "https://www.payfast.co.za/eng/process";

// // Generate PayFast payment signature
// function generateSignature(data) {
//   const signatureString = Object.keys(data)
//     .filter((key) => data[key] !== "")
//     .map((key) => `${key}=${encodeURIComponent(data[key].trim())}`)
//     .join("&");

//   return crypto
//     .createHash("md5")
//     .update(
//       signatureString +
//         (PAYFAST_PASSPHRASE ? `&passphrase=${PAYFAST_PASSPHRASE}` : "")
//     )
//     .digest("hex");
// }

// // Process registration payment
// exports.processRegistrationPayment = async (user, amount) => {
//   try {
//     const paymentData = {
//       merchant_id: PAYFAST_MERCHANT_ID,
//       merchant_key: PAYFAST_MERCHANT_KEY,
//       return_url: `${process.env.FRONTEND_URL}/payment-success`,
//       cancel_url: `${process.env.FRONTEND_URL}/payment-cancel`,
//       notify_url: `${process.env.BACKEND_URL}/api/payments/webhook`,
//       name_first: user.firstName,
//       name_last: user.lastName,
//       email_address: user.email,
//       cell_number: user.phone,
//       m_payment_id: user._id.toString(),
//       amount: amount.toString(),
//       item_name: "Community Funeral Aid Registration",
//       item_description: "Initial registration fee and first contribution",
//       custom_int1: user.community.toString(),
//       custom_str1: user.section.toString(),
//     };

//     paymentData.signature = generateSignature(paymentData);

//     return {
//       paymentUrl: `${PAYFAST_URL}?${new URLSearchParams(
//         paymentData
//       ).toString()}`,
//       paymentData,
//     };
//   } catch (error) {
//     console.error("Payment processing error:", error);
//     throw new Error("Failed to process payment");
//   }
// };

// // Process contribution payment
// exports.processContributionPayment = async (userId, amount, description) => {
//   const user = await User.findById(userId);
//   if (!user) throw new Error("User not found");

//   const paymentData = {
//     merchant_id: PAYFAST_MERCHANT_ID,
//     merchant_key: PAYFAST_MERCHANT_KEY,
//     return_url: `${process.env.FRONTEND_URL}/dashboard`,
//     cancel_url: `${process.env.FRONTEND_URL}/dashboard`,
//     notify_url: `${process.env.BACKEND_URL}/api/payments/webhook`,
//     name_first: user.firstName,
//     name_last: user.lastName,
//     email_address: user.email,
//     cell_number: user.phone,
//     m_payment_id: `contribution-${Date.now()}`,
//     amount: amount.toString(),
//     item_name: "Community Contribution",
//     item_description: description || "Monthly contribution payment",
//     custom_int1: user.community.toString(),
//     custom_str1: user.section.toString(),
//   };

//   paymentData.signature = generateSignature(paymentData);

//   return {
//     paymentUrl: `${PAYFAST_URL}?${new URLSearchParams(paymentData).toString()}`,
//     paymentData,
//   };
// };

// // Handle PayFast ITN (Instant Transaction Notification)
// exports.handlePaymentNotification = async (data) => {
//   try {
//     // Verify the signature
//     const signature = generateSignature(data);
//     if (signature !== data.signature) {
//       throw new Error("Invalid signature");
//     }

//     const paymentStatus = data.payment_status;
//     const userId = data.m_payment_id;

//     if (paymentStatus === "COMPLETE") {
//       // Handle registration payment
//       if (!userId.startsWith("contribution-")) {
//         console.log("Activating account");
//         await activateUserAccount(userId);
//       } else {
//         // Handle contribution payment
//         await recordContributionPayment(userId, data.amount_gross);
//       }
//     }

//     return { success: true };
//   } catch (error) {
//     console.error("Payment notification error:", error);
//     throw error;
//   }
// };

// // Activate user account after payment
// async function activateUserAccount(userId) {
//   const user = await User.findByIdAndUpdate(
//     userId,
//     {
//       isActive: true,
//       lastPaymentDate: new Date(),
//       status: "active",
//     },
//     { new: true }
//   );

//   if (!user) throw new Error("User not found");

//   await sendEmail({
//     to: user.email,
//     subject: "Account Activated",
//     html: `<p>Your Community Funeral Aid account has been activated. Welcome!</p>`,
//   });
// }

// // Record contribution payment
// async function recordContributionPayment(userId, amount) {
//   const user = await User.findByIdAndUpdate(
//     userId,
//     {
//       lastPaymentDate: new Date(),
//       $inc: { strikes: -1 }, // Reset strikes on payment
//     },
//     { new: true }
//   );

//   if (!user) throw new Error("User not found");

//   // Update section balance
//   await Section.findByIdAndUpdate(user.section, {
//     $inc: {
//       currentBalance: amount * 0.85, // 85% to section
//       totalContributions: amount,
//     },
//   });

//   // Update community balance (15% admin fee)
//   await Community.findByIdAndUpdate(user.community, {
//     $inc: {
//       currentBalance: amount * 0.15,
//     },
//   });

//   await sendEmail({
//     to: user.email,
//     subject: "Contribution Received",
//     html: `<p>Thank you for your contribution of ZAR ${amount}. Your account is up to date.</p>`,
//   });
// }
