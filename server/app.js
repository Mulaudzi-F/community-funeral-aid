const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const morgan = require("morgan");
const fileupload = require("express-fileupload");
const { initializeScheduledJobs } = require("./service/schedulerService");

// Route imports
const authRoutes = require("./Routes/authRoutes");
const userRoutes = require("./Routes/userRoutes");
const communityRoutes = require("./Routes/communityRoutes");
const sectionRoutes = require("./Routes/sectionRoutes");
const beneficiaryRoutes = require("./Routes/beneficiaryRoutes");
const deathReportRoutes = require("./Routes/deathReportRoutes");
const paymentRoutes = require("./Routes/paymentRoutes");
const adminRoutes = require("./Routes/adminRoutes");

// Middleware imports
const { protect } = require("./middleware/auth");
const { errorHandler } = require("./middleware/error");

// Create express app
const app = express();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    // Initialize scheduled jobs after DB connection
    initializeScheduledJobs();
  })
  .catch((err) => console.error("MongoDB connection error:", err));

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  })
);
app.use(express.json());
app.use(fileupload());
app.use(morgan("dev"));

// Static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/communities", communityRoutes);
app.use("/api/sections", sectionRoutes);
app.use("/api/beneficiaries", protect, beneficiaryRoutes);
app.use("/api/death-reports", protect, deathReportRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", protect, adminRoutes);

// Error handler
app.use(errorHandler);

module.exports = app;
