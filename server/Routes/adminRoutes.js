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
} = require("../controllers/adminController");
const { protect, admin } = require("../middleware/auth");

router.use(protect, admin);

router.get("/users", getAllUsers);
router.route("/users/:id").get(getUserById).put(updateUserStatus);

router.get("/death-reports", getAllDeathReports);
router.get("/death-reports/pending", getPendingReports);

router.get("/finances", getCommunityFinances);

router.post("/notify", sendSystemNotification);

module.exports = router;
