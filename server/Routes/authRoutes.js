const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { protect } = require("../middleware/auth");

// Route for user registration
router.post("/register", authController.register);

// Route for user login
router.post("/login", authController.login);
// Route for user logout
router.post("/logout", protect, authController.logout);
// Route to get the current logged-in user's details
router.get("/me", protect, authController.getUserProfile);

// router.post(
//   "/send-verification",
//   protect,
//   authController.sendVerificationEmail
// );
// router.get("/verify-email", authController.verifyEmail);

module.exports = router;
