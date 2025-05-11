const express = require("express");
const router = express.Router();
const deathReportController = require("../controllers/deathReport");
const { protect, admin } = require("../middleware/auth");

// @route   POST /api/death-reports
// @desc    Create a new death report
// @access  Private
router.post("/", protect, deathReportController.createDeathReport);

// @route   POST /api/death-reports/:id/vote
// @desc    Vote on a death report
// @access  Private
router.post("/:id/vote", protect, deathReportController.voteOnDeathReport);

// @route   PUT /api/death-reports/:id/review
// @desc    Admin review of a death report
// @access  Private/Admin
router.put(
  "/:id/review",
  protect,
  admin,
  deathReportController.reviewDeathReport
);

router.route("/:id").get(protect, deathReportController.getDeathReportById);

module.exports = router;
