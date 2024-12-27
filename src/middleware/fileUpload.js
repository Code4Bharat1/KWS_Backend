import multer from "multer";
import fs from "fs";
import path from "path";

// Ensure directory exists
const ensureDirectoryExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadDir = "uploads/";
    if (file.fieldname === "profile_picture") {
      uploadDir += "profile-pictures";
    } else if (file.fieldname === "form_scanned") {
      uploadDir += "form-scanned";
    }
    ensureDirectoryExists(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}`);
  },
});

// File size and type validation
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
  if (!allowedTypes.includes(file.mimetype)) {
    cb(new Error(`Invalid file type: ${file.mimetype}. Only JPEG, PNG, and GIF are allowed.`));
  } else {
    cb(null, true);
  }
};

// Multer configuration
const upload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit
  },
  fileFilter,
});

// Middleware for handling multiple fields
export const uploadFiles = upload.fields([
  { name: "profile_picture", maxCount: 1 }, // Single file
  { name: "form_scanned", maxCount: 1 }, // Up to 10 files
]);