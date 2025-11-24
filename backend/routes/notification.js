const express = require('express');
const { getUserNotifications, markAsRead } = require('../controllers/notificationController');
const { protect } = require('../middlewares/auth');

const router = express.Router();
router.use(protect);

router.get('/', getUserNotifications);
router.patch('/read', markAsRead);

module.exports = router;