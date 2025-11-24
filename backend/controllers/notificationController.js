const prisma = require('../utils/database');
const { successResponse, errorResponse } = require('../utils/responseHelper');
const { emitToUser } = require('../utils/socket');

const createNotification = async (userId, message, type = 'SYSTEM', context = null) => {
  const notification = await prisma.notification.create({
    data: {
      userId,
      message,
      type,
      ...(context && { context })
    }
  });

  emitToUser(userId, 'notification:new', notification);
  return notification;
};

const getUserNotifications = async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    successResponse(res, 'Notifications retrieved', { notifications });
  } catch (error) {
    errorResponse(res, 'Error fetching notifications', 500);
  }
};

const markAsRead = async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, isRead: false },
      data: { isRead: true }
    });
    successResponse(res, 'Notifications marked as read');
  } catch (error) {
    errorResponse(res, 'Error updating notifications', 500);
  }
};

module.exports = { createNotification, getUserNotifications, markAsRead };