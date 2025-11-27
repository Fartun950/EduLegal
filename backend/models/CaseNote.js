// Case Note Model
// Defines the CaseNote schema for the database
// Confidential notes are only visible to admin and legalOfficer

import mongoose from 'mongoose';

/**
 * Case Note Schema
 * Defines the structure of case note documents in the database
 */
const caseNoteSchema = mongoose.Schema(
  {
    // Reference to Case this note belongs to
    case: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Case',
      required: [true, 'Case reference is required'],
    },
    // Reference to User who created the note
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author is required'],
    },
    // Note content
    note: {
      type: String,
      required: [true, 'Note is required'],
      trim: true,
    },
    // Whether note is confidential (always true for case notes)
    confidential: {
      type: Boolean,
      default: true,
    },
  },
  {
    // Automatically add createdAt and updatedAt timestamps
    timestamps: true,
  }
);

/**
 * Index on case for faster queries when filtering by case
 */
caseNoteSchema.index({ case: 1 });

/**
 * Index on author for faster queries when filtering by author
 */
caseNoteSchema.index({ author: 1 });

/**
 * Index on confidential for faster queries
 */
caseNoteSchema.index({ confidential: 1 });

/**
 * Compound index on case and createdAt for sorting notes by case
 */
caseNoteSchema.index({ case: 1, createdAt: -1 });

// Create and export CaseNote model
export default mongoose.model('CaseNote', caseNoteSchema);

