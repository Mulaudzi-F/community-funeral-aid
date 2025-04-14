const path = require("path");
const fs = require("fs");
const { promisify } = require("util");
const mkdirAsync = promisify(fs.mkdir);

// Ensure upload directory exists
const ensureUploadsDir = async () => {
  const uploadPath = path.join(__dirname, "../../uploads");
  const deathCertPath = path.join(uploadPath, "death_certificates");

  try {
    await mkdirAsync(uploadPath, { recursive: true });
    await mkdirAsync(deathCertPath, { recursive: true });
  } catch (err) {
    console.error("Could not create upload directories:", err);
  }
};

// File upload middleware
exports.uploadFiles = async (req, res, next) => {
  await ensureUploadsDir();

  if (!req.files) {
    return next();
  }

  // Process each file
  const filePromises = Object.keys(req.files).map(async (field) => {
    const file = req.files[field];
    const fileExt = path.extname(file.name);
    const fileName = `${file.md5}${fileExt}`;
    const filePath = path.join(
      __dirname,
      "../../uploads",
      field === "deathCertificate" ? "death_certificates" : "",
      fileName
    );

    try {
      await file.mv(filePath);
      req.body[field] = filePath; // Save path in request body
    } catch (err) {
      console.error(`Error saving ${field}:`, err);
      throw err;
    }
  });

  try {
    await Promise.all(filePromises);
    next();
  } catch (err) {
    console.error("File upload error:", err);
    res.status(500).json({
      success: false,
      message: "Error uploading files",
    });
  }
};

// File size and type validation
exports.validateFiles = (options) => {
  return (req, res, next) => {
    if (!req.files) {
      return next();
    }

    const errors = [];
    const maxSize = (options.maxSize || 5) * 1024 * 1024; // Default 5MB

    Object.keys(req.files).forEach((field) => {
      const file = req.files[field];

      // Check file size
      if (file.size > maxSize) {
        errors.push(
          `File ${field} exceeds maximum size of ${options.maxSize}MB`
        );
      }

      // Check file type if specified
      if (options.allowedTypes && options.allowedTypes[field]) {
        const allowedTypes = options.allowedTypes[field];
        if (!allowedTypes.includes(file.mimetype)) {
          errors.push(
            `Invalid file type for ${field}. Allowed types: ${allowedTypes.join(
              ", "
            )}`
          );
        }
      }
    });

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "File validation failed",
        errors,
      });
    }

    next();
  };
};
