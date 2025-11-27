// Complaint File Upload Middleware
// Handles file uploads for complaint evidence/attachments
// Uses Multer for file handling

import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists for complaints
const uploadsDir = path.join(__dirname, '../uploads/complaints');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage for complaint attachments
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-random-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
    cb(null, `${uniqueSuffix}-${name}${ext}`);
  },
});

// File filter - only allow specific file types for evidence
const fileFilter = (req, file, cb) => {
  // Allowed file types for complaint evidence
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'text/plain',
    'video/mp4',
    'video/mpeg',
    'audio/mpeg',
    'audio/wav',
  ];
  
  // Check if file type is allowed
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type: ${file.mimetype}. Allowed types: PDF, DOC, DOCX, JPG, PNG, GIF, TXT, MP4, MPEG, MP3, WAV`), false);
  }
};

// Configure multer for complaint attachments
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
});

/**
 * Middleware for multiple file uploads (complaint evidence)
 * Allows up to 5 files per complaint
 */
export const uploadComplaintFiles = upload.array('attachments', 5);

/**
 * Error handler for multer errors in complaint uploads
 */
export const handleComplaintUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 10MB per file',
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum is 5 files per complaint',
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field. Use "attachments" field name',
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message || 'File upload error',
    });
  }
  
  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message || 'File upload error',
    });
  }
  
  next();
};



