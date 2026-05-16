const prisma = require('../prismaClient');

// Check if user is a member of the project (any role)
const isMember = async (req, res, next) => {
  const projectId = req.params.projectId || req.params.id;
  const userId = req.user.id;

  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (project.ownerId === userId) {
      req.projectRole = 'ADMIN';
      return next();
    }

    const member = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId: projectId,
          userId: userId
        }
      }
    });

    if (!member) {
      return res.status(403).json({ error: 'Access denied. You are not a member of this project.' });
    }

    req.projectRole = member.role;
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error checking project membership' });
  }
};

// Check if user is an ADMIN of the project
const isAdmin = async (req, res, next) => {
  // Rely on isMember to have run first and set req.projectRole
  if (!req.projectRole) {
    return res.status(500).json({ error: 'Internal server error: roleCheck missing isMember pre-requisite' });
  }

  if (req.projectRole !== 'ADMIN') {
    return res.status(403).json({ error: 'Access denied. Admin role required.' });
  }

  next();
};

module.exports = { isMember, isAdmin };
