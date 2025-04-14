const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { protect } = require("../middleware/auth");

// Route for user registration
router.post("/register", authController.register);

// Route for user login
router.post("/login", authController.login);

// Route to get the current logged-in user's details
router.get("/me", protect, authController.getUserProfile);

module.exports = router;
