// Settings Controller
// Handles settings-related operations
// Guest users can delete their own complaints and update theme preferences

import Case from '../models/Case.js';
import User from '../models/User.js';
import CaseNote from '../models/CaseNote.js';
import CaseDocument from '../models/CaseDocument.js';
import CaseActivity from '../models/CaseActivity.js';

/**
 * Delete guest complaint
 * DELETE /api/settings/complaint/:id
 * Guest users can delete complaints they submitted
 * For authenticated users: can delete if they created it
 * For anonymous guests: can delete if they provide the name/email used in submission
 */
export const deleteGuestComplaint = async (req, res) => {
  try {
    const { id: caseId } = req.params;
    const { name, email } = req.body; // Optional: for anonymous guest deletion verification
    
    // Find case
    const caseData = await Case.findById(caseId);
    
    if (!caseData) {
      return res.status(404).json({
        success: false,
        message: 'Case not found',
      });
    }
    
    // Check if user is authenticated
    if (req.user) {
      // Authenticated user - check if they created this case
      const isCreator = caseData.createdBy && 
        caseData.createdBy.toString() === req.user._id.toString();
      
      if (!isCreator) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only delete complaints you submitted.',
        });
      }
    } else {
      // Anonymous guest - verify ownership using name/email
      if (!name || !email) {
        return res.status(400).json({
          success: false,
          message: 'Please provide name and email to verify ownership',
        });
      }
      
      // Check if case matches provided name/email
      // For anonymous cases, we match against the name field and potentially check if email matches
      // Since anonymous cases don't store email, we rely on name matching
      const caseName = caseData.name || '';
      if (caseName.toLowerCase().trim() !== name.toLowerCase().trim()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Name does not match the complaint submission.',
        });
      }
    }
    
    // Delete associated notes, documents, and activities
    await CaseNote.deleteMany({ case: caseId });
    await CaseDocument.deleteMany({ case: caseId });
    await CaseActivity.deleteMany({ case: caseId });
    
    // Delete the case
    await Case.findByIdAndDelete(caseId);
    
    res.status(200).json({
      success: true,
      message: 'Complaint deleted successfully',
      data: {},
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Case not found',
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error deleting complaint',
      error: error.message,
    });
  }
};

/**
 * Update user preferences (theme, etc.)
 * PUT /api/settings/preferences
 * Authenticated users can update their preferences
 */
export const updatePreferences = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required to update preferences',
      });
    }
    
    const { theme } = req.body;
    
    // Build preferences object
    const preferences = {};
    if (theme) {
      if (!['light', 'dark'].includes(theme)) {
        return res.status(400).json({
          success: false,
          message: 'Theme must be "light" or "dark"',
        });
      }
      preferences.theme = theme;
    }
    
    // Update user preferences
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    
    // Merge preferences
    user.preferences = {
      ...user.preferences,
      ...preferences,
    };
    
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Preferences updated successfully',
      data: {
        preferences: user.preferences,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating preferences',
      error: error.message,
    });
  }
};

/**
 * Get user preferences
 * GET /api/settings/preferences
 * Returns current user's preferences
 */
export const getPreferences = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required to get preferences',
      });
    }
    
    const user = await User.findById(req.user._id).select('preferences');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        preferences: user.preferences || { theme: 'light' },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching preferences',
      error: error.message,
    });
  }
};

