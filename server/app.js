const express = require("express");
const mongoose = require("mongoose");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const expressSanitizer = require("express-sanitizer");
const cors = require("cors");
const hpp = require("hpp");
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
const dashboardRoutes = require("./Routes/dashboardRoutes");
const activityRoutes = require("./Routes/activityRoutes");

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
// Set secure headers
app.use(helmet());

// Prevent HTTP Parameter Pollution
app.use(hpp());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

const allowedOrigins = [
  "https://community-aid-app-2-p64vfch9h-fhatuwani-mulaudzis-projects.vercel.app",
  "https://delicate-centaur-2db5d3.netlify.app",
  "https://community-aid-app-2-mulaudzi-f-fhatuwani-mulaudzis-projects.vercel.app",
  "http://localhost:5173", 
  "http://localhost:8081"
];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(expressSanitizer()); // Sanitize user input to prevent XSS attacks
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
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/activities", activityRoutes);

// Error handler
app.use(errorHandler);

module.exports = app;
