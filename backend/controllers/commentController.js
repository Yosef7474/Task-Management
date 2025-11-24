const prisma = require('../utils/database');
const { successResponse, errorResponse } = require('../utils/responseHelper');
const { createNotification } = require('./notificationController');
const { logActivity } = require('./activityController');

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
        assignees: { select: { userId: true } }
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
    task.assignees.forEach(({ userId: assigneeId }) => {
      if (assigneeId !== userId) recipients.add(assigneeId);
    });
    if (task.createdById !== userId) {
      recipients.add(task.createdById);
    }

    if (recipients.size) {
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
    }

    await logActivity(
      userId,
      'COMMENT_ADDED',
      `Added comment: ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`,
      taskId
    );

    successResponse(res, 'Comment added', { comment }, 201);
  } catch (error) {
    console.error('addComment error:', error);
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
    
    // Get comment details before deletion for logging
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: { task: true }
    });

    await prisma.comment.delete({ where: { id: commentId } });

    // Log activity
    await logActivity(req.user.id, 'COMMENT_DELETED', `Deleted comment from task: ${comment.task.title}`, comment.taskId);

    successResponse(res, 'Comment deleted');
  } catch (error) {
    errorResponse(res, 'Error deleting comment', 500);
  }
};

module.exports = { addComment, getTaskComments, deleteComment };