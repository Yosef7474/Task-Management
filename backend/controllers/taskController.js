const prisma = require('../utils/database');
const { successResponse, errorResponse } = require('../utils/responseHelper');
const { createNotification } = require('./notificationController');
const { logActivity } = require('./activityController');

const baseTaskInclude = {
  createdBy: { select: { id: true, name: true, email: true } },
  assignees: {
    include: {
      user: { select: { id: true, name: true, email: true } }
    }
  },
  comments: { include: { user: { select: { name: true } } } },
  attachments: true
};

const detailedTaskInclude = {
  createdBy: { select: { id: true, name: true, email: true } },
  assignees: {
    include: {
      user: { select: { id: true, name: true, email: true } }
    }
  },
  comments: {
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: 'desc' }
  },
  attachments: { orderBy: { uploadedAt: 'desc' } }
};

const parseAssigneeIds = (body) => {
  if (Array.isArray(body.assignedToIds)) {
    return [...new Set(body.assignedToIds.map((id) => parseInt(id)).filter(Boolean))];
  }

  if (body.assignedToId !== undefined && body.assignedToId !== null && body.assignedToId !== '') {
    return [parseInt(body.assignedToId)];
  }

  return [];
};

const syncTaskAssignees = async (taskId, currentIds = [], nextIds = []) => {
  const uniqueNext = [...new Set(nextIds)];

  const idsToAdd = uniqueNext.filter((userId) => !currentIds.includes(userId));
  const idsToRemove = currentIds.filter((userId) => !uniqueNext.includes(userId));

  if (idsToRemove.length) {
    await prisma.taskAssignee.deleteMany({
      where: { taskId, userId: { in: idsToRemove } }
    });
  }

  if (idsToAdd.length) {
    await prisma.taskAssignee.createMany({
      data: idsToAdd.map((userId) => ({ taskId, userId })),
      skipDuplicates: true
    });
  }

  return { idsToAdd, idsToRemove, nextIds: uniqueNext };
};

const createTask = async (req, res) => {
  try {
    const { title, description, priority, dueDate } = req.body;
    const createdById = req.user.id;
    const assigneeIds = parseAssigneeIds(req.body);

    if (!title) {
      return errorResponse(res, 'Title is required', 400);
    }

    if (req.user.role === 'USER') {
      return errorResponse(res, 'Access denied. Manager role or Admin role required', 403);
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        createdById
      }
    });

    if (assigneeIds.length) {
      await prisma.taskAssignee.createMany({
        data: assigneeIds.map((userId) => ({ taskId: task.id, userId })),
        skipDuplicates: true
      });

      await Promise.all(
        assigneeIds.map((userId) =>
          createNotification(
            userId,
            `You have been assigned to task "${task.title}"`,
            'TASK_ASSIGNED',
            { taskId: task.id }
          )
        )
      );
    }

    const taskWithRelations = await prisma.task.findUnique({
      where: { id: task.id },
      include: detailedTaskInclude
    });

    await logActivity(req.user.id, 'TASK_CREATED', `Created task: ${title}`, task.id);

    successResponse(res, 'Task created successfully', { task: taskWithRelations }, 201);
  } catch (error) {
    console.error('createTask error:', error);
    errorResponse(res, 'Error creating task', 500);
  }
};
const getTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const isMyTasksRoute = req.path.includes('/my-tasks');

    let whereClause = {};

    if (userRole === 'USER' || isMyTasksRoute) {
      whereClause = { assignees: { some: { userId } } };
    } else if (userRole === 'MANAGER') {
      whereClause = { createdById: userId };
    }

    const tasks = await prisma.task.findMany({
      where: whereClause,
      include: baseTaskInclude,
      orderBy: { createdAt: 'desc' }
    });

    successResponse(res, 'Tasks retrieved successfully', { tasks });
  } catch (error) {
    console.error('getTasks error:', error);
    errorResponse(res, 'Error fetching tasks', 500);
  }
};

const getTaskById = async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const userId = req.user.id;
    const userRole = req.user.role;
    const isMyTasksRoute = req.path.includes('/my-tasks');

    let whereClause = { id: taskId };

    if (userRole === 'USER' || isMyTasksRoute) {
      whereClause = {
        ...whereClause,
        assignees: { some: { userId } }
      };
    } else if (userRole === 'MANAGER') {
      whereClause = {
        ...whereClause,
        createdById: userId
      };
    }

    const task = await prisma.task.findFirst({
      where: whereClause,
      include: detailedTaskInclude
    });

    if (!task) {
      return errorResponse(res, 'Task not found', 404);
    }

    successResponse(res, 'Task retrieved successfully', { task });
  } catch (error) {
    console.error('getTaskById error:', error);
    errorResponse(res, 'Error fetching task', 500);
  }
};
const updateTask = async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const userId = req.user.id;
    const { title, description, status, priority, dueDate } = req.body;

    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        OR: [
          { createdById: userId },
          { assignees: { some: { userId } } }
        ]
      },
      include: {
        assignees: true
      }
    });

    if (!task) {
      return errorResponse(res, 'Task not found or access denied', 404);
    }

    const currentAssigneeIds = task.assignees.map((assignment) => assignment.userId);
    const assigneeIdsProvided =
      Array.isArray(req.body.assignedToIds) || req.body.assignedToId !== undefined;
    const nextAssigneeIds = assigneeIdsProvided
      ? parseAssigneeIds(req.body)
      : currentAssigneeIds;

    const changes = [];
    if (title && title !== task.title) changes.push(`title to "${title}"`);
    if (description !== undefined && description !== task.description) changes.push('description');
    if (status && status !== task.status) changes.push(`status to ${status}`);
    if (priority && priority !== task.priority) changes.push(`priority to ${priority}`);
    if (dueDate && task.dueDate?.toISOString() !== new Date(dueDate).toISOString()) {
      changes.push('due date');
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
        ...(priority && { priority }),
        ...(dueDate && { dueDate: new Date(dueDate) })
      },
      include: detailedTaskInclude
    });

    if (assigneeIdsProvided) {
      const { idsToAdd } = await syncTaskAssignees(taskId, currentAssigneeIds, nextAssigneeIds);

      if (idsToAdd.length) {
        await Promise.all(
          idsToAdd.map((assignedUserId) =>
            createNotification(
              assignedUserId,
              `You have been assigned to task "${updatedTask.title}"`,
              'TASK_ASSIGNED',
              { taskId: updatedTask.id }
            )
          )
        );
      }

      const usersToNotify = nextAssigneeIds.filter(
        (assignedUserId) => assignedUserId !== userId && !idsToAdd.includes(assignedUserId)
      );

      if (changes.length && usersToNotify.length) {
        await Promise.all(
          usersToNotify.map((assignedUserId) =>
            createNotification(
              assignedUserId,
              `Task "${updatedTask.title}" has been updated`,
              'TASK_UPDATED',
              { taskId: updatedTask.id }
            )
          )
        );
      }
    } else if (changes.length && currentAssigneeIds.length) {
      const usersToNotify = currentAssigneeIds.filter((assignedUserId) => assignedUserId !== userId);
      await Promise.all(
        usersToNotify.map((assignedUserId) =>
          createNotification(
            assignedUserId,
            `Task "${updatedTask.title}" has been updated`,
            'TASK_UPDATED',
            { taskId: updatedTask.id }
          )
        )
      );
    }

    if (changes.length > 0) {
      await logActivity(req.user.id, 'TASK_UPDATED', `Updated: ${changes.join(', ')}`, taskId);
    }

    const refreshedTask = await prisma.task.findUnique({
      where: { id: taskId },
      include: detailedTaskInclude
    });

    successResponse(res, 'Task updated successfully', { task: refreshedTask });
  } catch (error) {
    console.error('updateTask error:', error);
    errorResponse(res, 'Error updating task', 500);
  }
};

const deleteTask = async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const userId = req.user.id;

    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        createdById: userId
      },
      include: {
        assignees: true
      }
    });

    if (!task) {
      return errorResponse(res, 'Task not found or access denied', 404);
    }

    await prisma.task.delete({
      where: { id: taskId }
    });

    await logActivity(req.user.id, 'TASK_DELETED', `Deleted task: ${task.title}`, taskId);

    const notifyIds = task.assignees.map((assignment) => assignment.userId);
    if (notifyIds.length) {
      await Promise.all(
        notifyIds.map((assignedUserId) =>
          createNotification(
            assignedUserId,
            `Task "${task.title}" has been deleted`,
            'TASK_UPDATED',
            { taskId }
          )
        )
      );
    }

    successResponse(res, 'Task deleted successfully');
  } catch (error) {
    console.error('deleteTask error:', error);
    errorResponse(res, 'Error deleting task', 500);
  }
};


const searchTasks = async (req, res) => {
  try {
    const { q, status, priority, assignedTo } = req.query;
    const userId = req.user.id;
    const userRole = req.user.role;

    let whereClause = {};

    if (userRole === 'USER') whereClause = { ...whereClause, assignees: { some: { userId } } };
    else if (userRole === 'MANAGER') whereClause = { ...whereClause, createdById: userId };

    if (q) {
      whereClause = {
        ...whereClause,
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } }
        ]
      };
    }
    if (status) whereClause = { ...whereClause, status };
    if (priority) whereClause = { ...whereClause, priority };
    if (assignedTo) {
      whereClause = {
        ...whereClause,
        assignees: { some: { userId: parseInt(assignedTo) } }
      };
    }

    const tasks = await prisma.task.findMany({
      where: whereClause,
      include: baseTaskInclude,
      orderBy: { createdAt: 'desc' }
    });

    successResponse(res, 'Search results', { tasks });
  } catch (error) {
    console.error('searchTasks error:', error);
    errorResponse(res, 'Error searching tasks', 500);
  }
};


module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  searchTasks
};