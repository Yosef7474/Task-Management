const prisma = require('../utils/database');
const { successResponse, errorResponse } = require('../utils/responseHelper');
const { createNotification } = require('./notificationController');

const addComment = async (req, res) => {
  try {
    const taskId = parseInt(req.params.taskId);
    const { content } = req.body;
    const userId = req.user.id;

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: {
        id: true,
        title: true,
        createdById: true,
        assignedToId: true
      }
    });

    if (!task) {
      return errorResponse(res, 'Task not found', 404);
    }

    const comment = await prisma.comment.create({
      data: { content, taskId, userId },
      include: { user: { select: { id: true, name: true, email: true } } }
    });

    const recipients = new Set();
    if (task.assignedToId && task.assignedToId !== userId) {
      recipients.add(task.assignedToId);
    }
    if (task.createdById && task.createdById !== userId) {
      recipients.add(task.createdById);
    }

    await Promise.all(
      Array.from(recipients).map((recipientId) =>
        createNotification(
          recipientId,
          `New comment on "${task.title}"`,
          'COMMENT_ADDED',
          {
            taskId: task.id,
            commentId: comment.id,
            taskTitle: task.title
          }
        )
      )
    );

    successResponse(res, 'Comment added', { comment }, 201);
  } catch (error) {
    errorResponse(res, 'Error adding comment', 500);
  }
};

const getTaskComments = async (req, res) => {
  try {
    const taskId = parseInt(req.params.taskId);
    const comments = await prisma.comment.findMany({
      where: { taskId },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'asc' }
    });
    successResponse(res, 'Comments retrieved', { comments });
  } catch (error) {
    errorResponse(res, 'Error fetching comments', 500);
  }
};

const deleteComment = async (req, res) => {
  try {
    const commentId = parseInt(req.params.id);
    await prisma.comment.delete({ where: { id: commentId } });
    successResponse(res, 'Comment deleted');
  } catch (error) {
    errorResponse(res, 'Error deleting comment', 500);
  }
};

module.exports = { addComment, getTaskComments, deleteComment };