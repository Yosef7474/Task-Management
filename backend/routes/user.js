const express = require('express');
const { getTeamMembers } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.get('/team-members', getTeamMembers);

module.exports = router;