const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  getDashboardStats,
  getRecentActivity,
  getUpcomingPayments,
} = require("../controllers/dashboardController");

router.use(protect);

router.get("/", getDashboardStats);
router.get("/activity", getRecentActivity);
router.get("/payments", getUpcomingPayments);

module.exports = router;
