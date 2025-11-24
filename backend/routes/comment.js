const express = require('express');
const { addComment, getTaskComments, deleteComment } = require('../controllers/commentController');
const { protect } = require('../middlewares/auth');

const router = express.Router();
router.use(protect);

router.post('/:taskId', addComment);
router.get('/:taskId', getTaskComments);
router.delete('/:id', deleteComment);

module.exports = router;
