// const {
//   processRegistrationPayment,
//   processContributionPayment,
//   handlePaymentNotification,
// } = require("../service/paymentService");
// const User = require("../models/user");
// const { protect } = require("../middleware/auth");

// // @desc    Initiate registration payment
// // @route   POST /api/payments/register
// // @access  Private (for new users)
// exports.initiateRegistrationPayment = async (req, res) => {
//   try {
//     const user = await User.findById(req.user._id);
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     if (user.isActive) {
//       return res.status(400).json({ message: "Account is already active" });
//     }

//     const amount = user.community.registrationFee || 18;
//     const payment = await processRegistrationPayment(user, amount);

//     res.json({
//       paymentUrl: payment.paymentUrl,
//       paymentData: payment.paymentData,
//     });
//   } catch (error) {
//     console.error(error);
//     res
//       .status(500)
//       .json({ message: error.message || "Payment initiation failed" });
//   }
// };

// // @desc    Initiate contribution payment
// // @route   POST /api/payments/contribute
// // @access  Private
// exports.initiateContributionPayment = async (req, res) => {
//   try {
//     const { amount, description } = req.body;
//     const user = await User.findById(req.user._id);

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     const contributionAmount =
//       amount || user.community.contributionAmount || 15;
//     const payment = await processContributionPayment(
//       user._id,
//       contributionAmount,
//       description || "Monthly contribution"
//     );

//     res.json({
//       paymentUrl: payment.paymentUrl,
//       paymentData: payment.paymentData,
//     });
//   } catch (error) {
//     console.error(error);
//     res
//       .status(500)
//       .json({ message: error.message || "Payment initiation failed" });
//   }
// };

// // @desc    Handle payment webhook
// // @route   POST /api/payments/webhook
// // @access  Public (called by PayFast)
// exports.handlePaymentWebhook = async (req, res) => {
//   try {
//     const result = await handlePaymentNotification(req.body);
//     res.status(200).send("OK");
//   } catch (error) {
//     console.error("Webhook error:", error);
//     res.status(400).send("Error processing payment");
//   }
// };

// // @desc    Check payment status
// // @route   GET /api/payments/status/:userId
// // @access  Private
// exports.checkPaymentStatus = async (req, res) => {
//   try {
//     const user = await User.findById(req.params.userId);
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     res.json({
//       isActive: user.isActive,
//       lastPaymentDate: user.lastPaymentDate,
//       status: user.status,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Failed to check payment status" });
//   }
// };

//------------------------------------Payfast Controller------------------------------------//

const {
  initiateFuneralContribution,
  handleITN,
  getUserPaymentHistory,
} = require("../service/payfastService");
const { protect } = require("../middleware/auth");

// @desc    Initiate funeral contribution payment
// @route   POST /api/payments/contribute/:deathReportId
// @access  Private
exports.initiateContribution = async (req, res) => {
  try {
    const { deathReportId } = req.params;
    const userId = req.user._id;

    const { paymentUrl } = await initiateFuneralContribution(
      userId,
      deathReportId
    );

    res.json({
      success: true,
      data: { paymentUrl },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || "Payment initiation failed",
    });
  }
};

// @desc    Handle PayFast ITN
// @route   POST /api/payments/itn
// @access  Public
exports.handlePaymentNotification = async (req, res) => {
  console.log("Raw ITN data:", req.body);
  try {
    const result = await handleITN(req.body);
    res.status(200).send("OK");
  } catch (error) {
    console.error("Payment notification error:", error);
    res.status(400).send("Error processing payment");
  }
};

// @desc    Get user payment history
// @route   GET /api/payments/history
// @access  Private
exports.getPaymentHistory = async (req, res) => {
  try {
    const payments = await getUserPaymentHistory(req.user._id, 20);
    res.json({ success: true, data: payments });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to get payment history",
    });
  }
};
