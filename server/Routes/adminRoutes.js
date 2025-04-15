const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateUserStatus,
  getAllDeathReports,
  getPendingReports,
  getCommunityFinances,
  sendSystemNotification,
  getAdminStats,
  getRecentReports,
  getAdminActivity,
} = require("../controllers/adminController");
const { protect, admin } = require("../middleware/auth");

router.use(protect, admin);

router.get("/users", getAllUsers);
router.route("/users/:id").get(getUserById).put(updateUserStatus);

router.get("/death-reports", getAllDeathReports);
router.get("/death-reports/pending", getPendingReports);

router.get("/finances", getCommunityFinances);

router.post("/notify", sendSystemNotification);

router.get("/stats", getAdminStats);
router.get("/recent-reports", getRecentReports);
router.get("/activity", getAdminActivity);

module.exports = router;
