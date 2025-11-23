const prisma = require('../utils/database');
const { hashPassword, comparePassword, generateToken } = require('../utils/authUtils');
const { successResponse, errorResponse } = require('../utils/responseHelper');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password, role = 'USER' } = req.body;

    // Validation
    if (!name || !email || !password) {
      return errorResponse(res, 'Please provide name, email and password', 400);
    }

    if (password.length < 6) {
      return errorResponse(res, 'Password must be at least 6 characters', 400);
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return errorResponse(res, 'User already exists with this email', 400);
    }

    // Create user
    const hashedPassword = await hashPassword(password);
    
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: role // ADMIN, MANAGER, or USER
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    // Generate token
    const token = generateToken(user.id, user.role);

    successResponse(res, 'User registered successfully', {
      user,
      token
    }, 201);

  } catch (error) {
    console.error('Register error:', error);
    errorResponse(res, 'Server error during registration', 500);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return errorResponse(res, 'Please provide email and password', 400);
    }

    // Check if user exists and is active
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user || !user.isActive) {
      return errorResponse(res, 'Invalid credentials or user inactive', 401);
    }

    // Check password
    const isPasswordValid = await comparePassword(password, user.password);
    
    if (!isPasswordValid) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    // Generate token
    const token = generateToken(user.id, user.role);

    // Return user data (without password)
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    };

    successResponse(res, 'Login successful', {
      user: userResponse,
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    errorResponse(res, 'Server error during login', 500);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    // User is already attached to req by protect middleware
    const user = {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      createdAt: req.user.createdAt
    };

    successResponse(res, 'User profile retrieved successfully', { user });

  } catch (error) {
    console.error('Get me error:', error);
    errorResponse(res, 'Server error retrieving user profile', 500);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const userId = req.user.id;

    // Check if email is already taken by another user
    if (email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: email.toLowerCase(),
          NOT: { id: userId }
        }
      });

      if (existingUser) {
        return errorResponse(res, 'Email is already taken', 400);
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(email && { email: email.toLowerCase() })
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    successResponse(res, 'Profile updated successfully', { user: updatedUser });

  } catch (error) {
    console.error('Update profile error:', error);
    errorResponse(res, 'Server error updating profile', 500);
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return errorResponse(res, 'Please provide current and new password', 400);
    }

    if (newPassword.length < 6) {
      return errorResponse(res, 'New password must be at least 6 characters', 400);
    }

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    // Verify current password
    const isCurrentPasswordValid = await comparePassword(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return errorResponse(res, 'Current password is incorrect', 401);
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword }
    });

    successResponse(res, 'Password changed successfully');

  } catch (error) {
    console.error('Change password error:', error);
    errorResponse(res, 'Server error changing password', 500);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
};