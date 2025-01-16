import multer from "multer";
import fs from "fs";
import path from "path";

// Ensure the directory exists for the file storage
const ensureDirectoryExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Configure multer storage for handling multiple fields
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadDir = "uploads/";  // Base directory for file uploads
    // Define different directories based on the field name
    if (file.fieldname === "profile_picture") {
      uploadDir += "profile-pictures"; // Directory for profile pictures
    } else if (file.fieldname === "form_scanned") {
      uploadDir += "form-scanned";  // Directory for form scans
    } else if (file.fieldname === "transactionSlip") {
      uploadDir += "transaction-slips";  // Directory for transaction slips
    }
    ensureDirectoryExists(uploadDir);  // Ensure the directory exists
    cb(null, uploadDir);  // Set destination for file storage
  },
  filename: (req, file, cb) => {
    // Generate unique file names based on current time and random number
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}`);  // Use field name as part of the file name
  },
});

// File size and type validation for the uploaded files
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "application/pdf"];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error(`Invalid file type: ${file.mimetype}. Only JPEG, PNG, GIF, and PDF are allowed.`));
  }
  cb(null, true);  // Continue if the file type is allowed
};

// Multer configuration with file size limits and file type validation
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per file
  },
  fileFilter,
});

// Middleware to handle multiple file fields (profile_picture, form_scanned, transactionSlip)
export const uploadFiles = upload.fields([
  { name: "profile_picture", maxCount: 1 },  // Max 1 file for profile_picture
  { name: "form_scanned", maxCount: 1 },  // Max 1 file for form_scanned
  { name: "transactionSlip", maxCount: 1 },  // Max 1 file for transactionSlip
]);
