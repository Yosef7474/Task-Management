const express = require('express');
const { getTeamMembers, getAllUsers, updateUserRole } = require('../controllers/userController');
const { protect, adminOnly } = require('../middlewares/auth');

const router = express.Router();

router.use(protect);
router.get('/team-members', getTeamMembers);

// Admin only routes
router.get('/', adminOnly, getAllUsers);
router.patch('/:id/role', adminOnly, updateUserRole);

module.exports = router;