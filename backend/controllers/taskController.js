const prisma = require('../utils/database');
const { successResponse, errorResponse } = require('../utils/responseHelper');

const createTask = async (req, res) => {
  try {
    const { title, description, priority, dueDate, assignedToId } = req.body;
    const createdById = req.user.id;

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
        assignedToId: assignedToId ? parseInt(assignedToId) : null,
        createdById,
      },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
      }
    });

    successResponse(res, 'Task created successfully', { task }, 201);
  } catch (error) {
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
      // User can only see assigned tasks
      whereClause = { assignedToId: userId };
    } else if (userRole === 'MANAGER') {
      // Manager can see tasks they created
      whereClause = { createdById: userId };
    }
    // Admin can see all tasks (empty where clause)

    const tasks = await prisma.task.findMany({
      where: whereClause,
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
        comments: { include: { user: { select: { name: true } } } },
        attachments: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    successResponse(res, 'Tasks retrieved successfully', { tasks });
  } catch (error) {
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
      whereClause.assignedToId = userId;
    } else if (userRole === 'MANAGER') {
      whereClause.createdById = userId;
    }

    const task = await prisma.task.findFirst({
      where: whereClause,
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
        comments: { 
          include: { user: { select: { id: true, name: true, email: true } } },
          orderBy: { createdAt: 'desc' }
        },
        attachments: { orderBy: { uploadedAt: 'desc' } },
      }
    });

    if (!task) {
      return errorResponse(res, 'Task not found', 404);
    }

    successResponse(res, 'Task retrieved successfully', { task });
  } catch (error) {
    errorResponse(res, 'Error fetching task', 500);
  }
};
const updateTask = async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const userId = req.user.id;
    const { title, description, status, priority, dueDate, assignedToId } = req.body;

    const task = await prisma.task.findFirst({
      where: { 
        id: taskId,
        OR: [
          { createdById: userId },
          { assignedToId: userId }
        ]
      }
    });

    if (!task) {
      return errorResponse(res, 'Task not found or access denied', 404);
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(status && { status }),
        ...(priority && { priority }),
        ...(dueDate && { dueDate: new Date(dueDate) }),
        ...(assignedToId && { assignedToId: parseInt(assignedToId) }),
      },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
      }
    });

    successResponse(res, 'Task updated successfully', { task: updatedTask });
  } catch (error) {
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
      }
    });

    if (!task) {
      return errorResponse(res, 'Task not found or access denied', 404);
    }

    await prisma.task.delete({
      where: { id: taskId }
    });

    successResponse(res, 'Task deleted successfully');
  } catch (error) {
    errorResponse(res, 'Error deleting task', 500);
  }
};


const searchTasks = async (req, res) => {
  try {
    const { q, status, priority, assignedTo } = req.query;
    const userId = req.user.id;
    const userRole = req.user.role;

    let whereClause = {};
    
    if (userRole === 'USER') whereClause.assignedToId = userId;
    else if (userRole === 'MANAGER') whereClause.createdById = userId;

    if (q) {
      whereClause.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } }
      ];
    }
    if (status) whereClause.status = status;
    if (priority) whereClause.priority = priority;
    if (assignedTo) whereClause.assignedToId = parseInt(assignedTo);

    const tasks = await prisma.task.findMany({
      where: whereClause,
      include: {
        createdBy: { select: { name: true } },
        assignedTo: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    successResponse(res, 'Search results', { tasks });
  } catch (error) {
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