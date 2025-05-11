const express = require("express");
const router = express.Router();
const {
  getUserActivities,
  createActivity,
  getUnreadCount,
} = require("../controllers/activityController");
const { protect } = require("../middleware/auth");

router.use(protect);

router.get("/", getUserActivities);
router.get("/unread", getUnreadCount);
router.post("/", createActivity);

module.exports = router;
