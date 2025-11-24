const prisma = require('../utils/database');
const { successResponse, errorResponse } = require('../utils/responseHelper');

const addComment = async (req, res) => {
  try {
    const taskId = parseInt(req.params.taskId);
    const { content } = req.body;
    const userId = req.user.id;

    const comment = await prisma.comment.create({
      data: { content, taskId, userId },
      include: { user: { select: { id: true, name: true, email: true } } }
    });

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