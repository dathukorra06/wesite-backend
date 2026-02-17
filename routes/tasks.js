const express = require('express');
const auth = require('../middleware/auth');
const { validate } = require('../middleware/errorHandler');
const {
  createTaskValidation,
  updateTaskValidation,
  taskQueryValidation
} = require('../middleware/validators');
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  getTaskStats
} = require('../controllers/taskController');

const router = express.Router();

// All routes are protected
router.use(auth);

// @route   GET /api/tasks/stats
// @desc    Get task statistics
// @access  Private
router.get('/stats', getTaskStats);

// @route   GET /api/tasks
// @desc    Get all tasks
// @access  Private
router.get('/', taskQueryValidation, validate, getTasks);

// @route   GET /api/tasks/:id
// @desc    Get single task
// @access  Private
router.get('/:id', getTask);

// @route   POST /api/tasks
// @desc    Create new task
// @access  Private
router.post('/', createTaskValidation, validate, createTask);

// @route   PUT /api/tasks/:id
// @desc    Update task
// @access  Private
router.put('/:id', updateTaskValidation, validate, updateTask);

// @route   DELETE /api/tasks/:id
// @desc    Delete task
// @access  Private
router.delete('/:id', deleteTask);

module.exports = router;