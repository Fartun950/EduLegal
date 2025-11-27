// Notification Service
// Helper functions to create notifications for various events
// Used by controllers to automatically create notifications

import Notification from '../models/Notification.js';
import User from '../models/User.js';

/**
 * Create notification for a single user
 * @param {String} userId - User ID to notify
 * @param {Object} notificationData - Notification data (type, title, message, relatedEntityType, relatedEntityId)
 * @returns {Promise<Object>} Created notification
 */
export const createNotificationForUser = async (userId, notificationData) => {
  try {
    const { type = 'info', title, message, relatedEntityType = 'system', relatedEntityId = null } = notificationData;
    
    const notification = await Notification.create({
      user: userId,
      type,
      title,
      message,
      relatedEntityType,
      relatedEntityId,
      read: false,
    });
    
    return notification;
  } catch (error) {
    console.error('Error creating notification for user:', error);
    throw error;
  }
};

/**
 * Create notifications for multiple users
 * @param {Array<String>} userIds - Array of user IDs to notify
 * @param {Object} notificationData - Notification data (type, title, message, relatedEntityType, relatedEntityId)
 * @returns {Promise<Array<Object>>} Array of created notifications
 */
export const createNotificationForUsers = async (userIds, notificationData) => {
  try {
    if (!userIds || userIds.length === 0) {
      return [];
    }
    
    const notifications = userIds.map(userId => ({
      user: userId,
      type: notificationData.type || 'info',
      title: notificationData.title,
      message: notificationData.message,
      relatedEntityType: notificationData.relatedEntityType || 'system',
      relatedEntityId: notificationData.relatedEntityId || null,
      read: false,
    }));
    
    const createdNotifications = await Notification.insertMany(notifications);
    return createdNotifications;
  } catch (error) {
    console.error('Error creating notifications for users:', error);
    throw error;
  }
};

/**
 * Create notifications for all users with a specific role
 * @param {String} role - User role ('admin', 'legalOfficer', 'guest')
 * @param {Object} notificationData - Notification data (type, title, message, relatedEntityType, relatedEntityId)
 * @returns {Promise<Array<Object>>} Array of created notifications
 */
export const createNotificationForRole = async (role, notificationData) => {
  try {
    // Find all users with the specified role
    const users = await User.find({ role }).select('_id');
    
    if (!users || users.length === 0) {
      return [];
    }
    
    const userIds = users.map(user => user._id);
    return await createNotificationForUsers(userIds, notificationData);
  } catch (error) {
    console.error(`Error creating notifications for role ${role}:`, error);
    throw error;
  }
};

/**
 * Notify all admin and legal officer users about a new case submission
 * This is called automatically when a guest submits a complaint
 * @param {Object} caseData - Case data object
 * @returns {Promise<Array<Object>>} Array of created notifications
 */
export const notifyNewCase = async (caseData) => {
  try {
    const { _id, title } = caseData;
    
    // Find all admin and legal officer users
    const users = await User.find({
      role: { $in: ['admin', 'legalOfficer'] },
    }).select('_id role');
    
    if (!users || users.length === 0) {
      console.warn('No admin or legal officer users found to notify');
      return [];
    }
    
    // Create notifications for each user
    const notifications = users.map(user => ({
      user: user._id,
      type: 'info',
      title: user.role === 'admin' 
        ? 'New Case Submitted' 
        : 'New Case Available for Assignment',
      message: user.role === 'admin'
        ? `A new case has been submitted: "${title}". Please review and assign to a legal officer.`
        : `A new case is available for assignment: "${title}".`,
      relatedEntityType: 'case',
      relatedEntityId: _id,
      read: false,
    }));
    
    const createdNotifications = await Notification.insertMany(notifications);
    return createdNotifications;
  } catch (error) {
    console.error('Error notifying about new case:', error);
    // Don't throw error - notification failure shouldn't break case creation
    return [];
  }
};

/**
 * Notify about case assignment
 * @param {Object} caseData - Case data object
 * @param {String} officerId - Legal officer ID who is assigned
 * @returns {Promise<Array<Object>>} Array of created notifications
 */
export const notifyCaseAssigned = async (caseData, officerId) => {
  try {
    const { _id, title } = caseData;
    
    // Get officer user details
    const officer = await User.findById(officerId);
    if (!officer) {
      console.warn('Officer not found for notification');
      return [];
    }
    
    // Find all admin users to notify
    const adminUsers = await User.find({ role: 'admin' }).select('_id');
    const adminUserIds = adminUsers.map(user => user._id);
    
    // Create notifications
    const notifications = [
      // Notification for assigned officer
      {
        user: officerId,
        type: 'info',
        title: 'Case Assigned to You',
        message: `You have been assigned to case: "${title}". Please review and begin investigation.`,
        relatedEntityType: 'case',
        relatedEntityId: _id,
        read: false,
      },
      // Notifications for admins
      ...adminUserIds.map(adminId => ({
        user: adminId,
        type: 'info',
        title: 'Case Assigned',
        message: `Case "${title}" has been assigned to ${officer.name}.`,
        relatedEntityType: 'case',
        relatedEntityId: _id,
        read: false,
      })),
    ];
    
    const createdNotifications = await Notification.insertMany(notifications);
    return createdNotifications;
  } catch (error) {
    console.error('Error notifying about case assignment:', error);
    return [];
  }
};

/**
 * Notify about case status change
 * @param {Object} caseData - Case data object
 * @param {String} newStatus - New status (open, inProgress, closed)
 * @returns {Promise<Array<Object>>} Array of created notifications
 */
export const notifyCaseStatusChanged = async (caseData, newStatus) => {
  try {
    const { _id, title, assignedTo, createdBy } = caseData;
    
    const statusMessages = {
      open: 'Case status changed to Open',
      inProgress: 'Case status changed to In Progress',
      closed: 'Case status changed to Closed',
    };
    
    const userIdsToNotify = [];
    
    // Notify assigned officer if exists
    if (assignedTo) {
      userIdsToNotify.push(assignedTo.toString());
    }
    
    // Notify case creator if authenticated user
    if (createdBy) {
      userIdsToNotify.push(createdBy.toString());
    }
    
    // Notify all admin users
    const adminUsers = await User.find({ role: 'admin' }).select('_id');
    adminUsers.forEach(admin => {
      const adminId = admin._id.toString();
      if (!userIdsToNotify.includes(adminId)) {
        userIdsToNotify.push(adminId);
      }
    });
    
    if (userIdsToNotify.length === 0) {
      return [];
    }
    
    const notifications = userIdsToNotify.map(userId => ({
      user: userId,
      type: 'info',
      title: statusMessages[newStatus] || 'Case Status Updated',
      message: `Case "${title}" status has been changed to ${newStatus}.`,
      relatedEntityType: 'case',
      relatedEntityId: _id,
      read: false,
    }));
    
    const createdNotifications = await Notification.insertMany(notifications);
    return createdNotifications;
  } catch (error) {
    console.error('Error notifying about case status change:', error);
    return [];
  }
};

