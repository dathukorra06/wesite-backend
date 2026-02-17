const express = require('express');
const { validate } = require('../middleware/errorHandler');
const auth = require('../middleware/auth');
const {
  registerValidation,
  loginValidation,
  updateProfileValidation,
  changePasswordValidation
} = require('../middleware/validators');
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword
} = require('../controllers/authController');

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', registerValidation, validate, register);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', loginValidation, validate, login);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, getMe);

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, updateProfileValidation, validate, updateProfile);

// @route   PUT /api/auth/change-password
// @desc    Change password
// @access  Private
router.put('/change-password', auth, changePasswordValidation, validate, changePassword);

module.exports = router;