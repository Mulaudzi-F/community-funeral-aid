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

// Public routes
router.get("/", getCommunities);
router.get("/:id", getCommunityById);
router.get("/:id/sections", getCommunitySections);

// Protected admin routes
router.use(protect, admin);

router.post("/", createCommunity);
router.put("/:id", updateCommunity);

module.exports = router;
