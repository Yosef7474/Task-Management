const prisma = require('../utils/database');
const { successResponse, errorResponse } = require('../utils/responseHelper');
const cloudinary = require('../utils/cloudinary');
const streamifier = require('streamifier');

const uploadToCloudinary = (fileBuffer, folder, originalname) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder || process.env.CLOUDINARY_FOLDER || 'task-attachments',
        resource_type: 'auto',
        use_filename: true,
        unique_filename: true,
        filename_override: originalname
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      }
    );

    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};

const uploadAttachment = async (req, res) => {
  try {
    const taskId = parseInt(req.params.taskId);

    if (!req.file) {
      return errorResponse(res, 'No file uploaded', 400);
    }

    const uploadResult = await uploadToCloudinary(
      req.file.buffer,
      process.env.CLOUDINARY_FOLDER,
      req.file.originalname
    );

    const attachment = await prisma.attachment.create({
      data: {
        filename: uploadResult.original_filename || req.file.originalname,
        fileUrl: uploadResult.secure_url,
        fileSize: req.file.size,
        cloudinaryId: uploadResult.public_id,
        taskId
      }
    });

    successResponse(res, 'File uploaded successfully', { attachment });
  } catch (error) {
    console.error('uploadAttachment error:', error);
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
    const attachment = await prisma.attachment.findUnique({
      where: { id: attachmentId }
    });

    if (!attachment) {
      return errorResponse(res, 'Attachment not found', 404);
    }

    if (attachment.cloudinaryId) {
      try {
        await cloudinary.uploader.destroy(attachment.cloudinaryId, { resource_type: 'auto' });
      } catch (cloudErr) {
        console.error('Cloudinary destroy error:', cloudErr);
      }
    }

    await prisma.attachment.delete({ where: { id: attachmentId } });
    successResponse(res, 'Attachment deleted');
  } catch (error) {
    console.error('deleteAttachment error:', error);
    errorResponse(res, 'Error deleting attachment', 500);
  }
};

module.exports = { uploadAttachment, getTaskAttachments, deleteAttachment };