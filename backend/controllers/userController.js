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

module.exports = {
  getTeamMembers,
};