const express = require("express");
const router = express.Router();
const {
  initiateRegistrationPayment,
  initiateContributionPayment,
  handlePaymentWebhook,
  checkPaymentStatus,
} = require("../controllers/paymentController");
const { protect } = require("../middleware/auth");

// Public route for PayFast webhook
router.post("/webhook", handlePaymentWebhook);

// Protected routes
router.use(protect);

router.post("/register", initiateRegistrationPayment);
router.post("/contribute", initiateContributionPayment);
router.get("/status/:userId", checkPaymentStatus);

module.exports = router;
