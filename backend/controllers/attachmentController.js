const prisma = require('../utils/database');
const { successResponse, errorResponse } = require('../utils/responseHelper');

const uploadAttachment = async (req, res) => {
  try {
    const taskId = parseInt(req.params.taskId);
    const { filename, originalname, size } = req.file;

    const attachment = await prisma.attachment.create({
      data: {
        filename: originalname,
        fileUrl: `/uploads/${filename}`,
        fileSize: size,
        taskId,
      },
    });

    successResponse(res, 'File uploaded successfully', { attachment });
  } catch (error) {
    errorResponse(res, 'Error uploading file', 500);
  }
};

const getTaskAttachments = async (req, res) => {
  try {
    const taskId = parseInt(req.params.taskId);
    const attachments = await prisma.attachment.findMany({
      where: { taskId },
      orderBy: { uploadedAt: 'desc' }
    });
    successResponse(res, 'Attachments retrieved', { attachments });
  } catch (error) {
    errorResponse(res, 'Error fetching attachments', 500);
  }
};

const deleteAttachment = async (req, res) => {
  try {
    const attachmentId = parseInt(req.params.id);
    await prisma.attachment.delete({ where: { id: attachmentId } });
    successResponse(res, 'Attachment deleted');
  } catch (error) {
    errorResponse(res, 'Error deleting attachment', 500);
  }
};

module.exports = { uploadAttachment, getTaskAttachments, deleteAttachment };