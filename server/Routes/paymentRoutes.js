const express = require("express");
const router = express.Router();
const {
  initiateContribution,
  handlePaymentNotification,
  getPaymentHistory,
} = require("../controllers/paymentController");
const { checkPaymentStatus } = require("../controllers/authController");
const { protect } = require("../middleware/auth");

router.get("/status/:reference", checkPaymentStatus);
// Public route for PayFast ITN

router.post("/itn", handlePaymentNotification);

// Protected routes
router.use(protect);

router.post("/contribute/:deathReportId", initiateContribution);
router.get("/history", getPaymentHistory);
//router.get("/status/:reference", checkPaymentStatus);

module.exports = router;
