const prisma = require('../utils/database');
const { successResponse, errorResponse } = require('../utils/responseHelper');

const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    
    let taskWhere = {};
    if (userRole === 'USER') taskWhere.assignedToId = userId;
    else if (userRole === 'MANAGER') taskWhere.createdById = userId;

    const [
      totalTasks,
      completedTasks,
      overdueTasks,
      recentTasks,
      userStats
    ] = await Promise.all([
      prisma.task.count({ where: taskWhere }),
      prisma.task.count({ where: { ...taskWhere, status: 'COMPLETED' } }),
      prisma.task.count({ 
        where: { 
          ...taskWhere, 
          dueDate: { lt: new Date() },
          status: { not: 'COMPLETED' }
        }
      }),
      prisma.task.findMany({
        where: taskWhere,
        include: {
          createdBy: { select: { name: true } },
          assignedTo: { select: { name: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
      prisma.user.count()
    ]);

    successResponse(res, 'Dashboard stats', {
      stats: {
        totalTasks,
        completedTasks,
        overdueTasks,
        inProgress: totalTasks - completedTasks,
        userCount: userRole === 'ADMIN' ? userStats : undefined
      },
      recentTasks
    });
  } catch (error) {
    errorResponse(res, 'Error fetching dashboard', 500);
  }
};

module.exports = { getDashboardStats };