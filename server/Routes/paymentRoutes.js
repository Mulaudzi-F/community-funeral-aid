const express = require("express");
const router = express.Router();
const {
  initiateContribution,
  handlePaymentNotification,
  getPaymentHistory,
} = require("../controllers/paymentController");
const { protect } = require("../middleware/auth");

// Public route for PayFast ITN
router.post("/itn", handlePaymentNotification);

// Protected routes
router.use(protect);

router.post("/contribute/:deathReportId", initiateContribution);
router.get("/history", getPaymentHistory);

module.exports = router;
