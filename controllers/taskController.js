const Task = require('../models/Task');

// @desc    Get all tasks for user
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res, next) => {
  try {
    const { status, priority, search, sortBy = 'createdAt', sortOrder = 'desc', page = 1, limit = 10 } = req.query;
    
    // Build query
    const query = { user: req.user.id };
    
    // Add filters
    if (status) {
      query.status = status;
    }
    
    if (priority) {
      query.priority = priority;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    // Execute query with pagination
    const skip = (page - 1) * limit;
    const tasks = await Task.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count for pagination
    const total = await Task.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: tasks.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      tasks
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
const getTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user.id
    });
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    res.status(200).json({
      success: true,
      task
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, dueDate } = req.body;
    
    const task = await Task.create({
      title,
      description,
      status,
      priority,
      dueDate,
      user: req.user.id
    });
    
    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      task
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res, next) => {
  try {
    let task = await Task.findOne({
      _id: req.params.id,
      user: req.user.id
    });
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    // Update task
    task = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      task
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user.id
    });
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    await task.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
      task
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get task statistics
// @route   GET /api/tasks/stats
// @access  Private
const getTaskStats = async (req, res, next) => {
  try {
    const totalTasks = await Task.countDocuments({ user: req.user.id });
    
    const statusCounts = await Task.aggregate([
      { $match: { user: req.user.id } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    const priorityCounts = await Task.aggregate([
      { $match: { user: req.user.id } },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);
    
    // Convert to objects for easier access
    const statusStats = {};
    statusCounts.forEach(item => {
      statusStats[item._id] = item.count;
    });
    
    const priorityStats = {};
    priorityCounts.forEach(item => {
      priorityStats[item._id] = item.count;
    });
    
    res.status(200).json({
      success: true,
      stats: {
        total: totalTasks,
        byStatus: statusStats,
        byPriority: priorityStats
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  getTaskStats
};