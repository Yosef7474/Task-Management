const express = require('express');
const { uploadAttachment, getTaskAttachments, deleteAttachment } = require('../controllers/attachmentController');
const { protect } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

const router = express.Router();
router.use(protect);

router.post('/:taskId/upload', upload.single('file'), uploadAttachment);
router.get('/:taskId', getTaskAttachments);
router.delete('/:id', deleteAttachment);

module.exports = router;