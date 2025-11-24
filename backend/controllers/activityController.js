const prisma = require('../utils/database');
const { successResponse, errorResponse } = require('../utils/responseHelper');

const logActivity = async (userId, action, details = null, taskId = null) => {
  await prisma.activity.create({
    data: { userId, action, details, taskId }
  });
};

const getTaskActivities = async (req, res) => {
  try {
    const activities = await prisma.activity.findMany({
      where: { taskId: parseInt(req.params.taskId) },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: 'desc' }
    });
    successResponse(res, 'Activities retrieved', { activities });
  } catch (error) {
    errorResponse(res, 'Error fetching activities', 500);
  }
};

module.exports = { logActivity, getTaskActivities };