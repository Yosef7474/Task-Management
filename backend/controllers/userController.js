const prisma = require('../utils/database');
const { successResponse, errorResponse } = require('../utils/responseHelper');

const getTeamMembers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      },
      orderBy: { name: 'asc' }
    });

    successResponse(res, 'Team members retrieved successfully', { users });
  } catch (error) {
    errorResponse(res, 'Error fetching team members', 500);
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true, name: true, email: true, role: true, 
        isActive: true, createdAt: true
      },
      orderBy: { name: 'asc' }
    });
    successResponse(res, 'Users retrieved', { users });
  } catch (error) {
    errorResponse(res, 'Error fetching users', 500);
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { role, isActive } = req.body;
    const user = await prisma.user.update({
      where: { id: parseInt(req.params.id) },
      data: { role, isActive },
      select: { id: true, name: true, email: true, role: true, isActive: true }
    });
    successResponse(res, 'User updated', { user });
  } catch (error) {
    errorResponse(res, 'Error updating user', 500);
  }
};


module.exports = {
  getTeamMembers,
  getAllUsers,
  updateUserRole
};