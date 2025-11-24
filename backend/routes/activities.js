const express = require('express');
const { getTaskActivities } = require('../controllers/activityController');
const { protect } = require('../middlewares/auth');

const router = express.Router();
router.use(protect);
router.get('/task/:taskId', getTaskActivities);

module.exports = router;