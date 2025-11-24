const express = require('express');
const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  searchTasks
} = require('../controllers/taskController');
const { protect, authorize, managerOrAdmin, userAccess } = require('../middlewares/auth');

const router = express.Router();

router.use(protect);

// User-specific routes
router.get('/my-tasks', getTasks);
router.get('/my-tasks/:id', userAccess, getTaskById);
router.put('/my-tasks/:id', userAccess, updateTask);
// router.patch('/my-tasks/:id/status', userAccess, updateTaskStatus);

// Manager/Admin routes
router.get('/', managerOrAdmin, getTasks);
router.get('/:id', managerOrAdmin, getTaskById);
router.post('/', managerOrAdmin, createTask);
router.put('/:id', managerOrAdmin, updateTask);
router.delete('/:id', managerOrAdmin, deleteTask);
// router.patch('/:id/status', managerOrAdmin, updateTaskStatus);
// router.patch('/:id/priority', managerOrAdmin, updateTaskPriority);


module.exports = router;