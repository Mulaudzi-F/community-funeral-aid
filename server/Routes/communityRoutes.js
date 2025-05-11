const express = require("express");
const router = express.Router();
const {
  getCommunities,
  getCommunityById,
  createCommunity,
  updateCommunity,
  getCommunitySections,
} = require("../controllers/communityController");
const { protect, admin } = require("../middleware/auth");
const {
  getCommunityStats,
} = require("../controllers/communityStatsController");

// Public routes
router.get("/", getCommunities);
router.get("/:id", getCommunityById);
router.get("/:id/sections", getCommunitySections);
router.post("/", createCommunity);
// Protected admin routes
router.use(protect, admin);

router.put("/:id", updateCommunity);
router.get("/:id/stats", protect, getCommunityStats);

module.exports = router;
