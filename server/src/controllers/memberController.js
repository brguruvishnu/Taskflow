const prisma = require('../prismaClient');

exports.getMembers = async (req, res) => {
  try {
    const projectId = req.params.projectId;

    const members = await prisma.projectMember.findMany({
      where: { projectId },
      include: {
        user: { select: { id: true, name: true, email: true } }
      }
    });

    res.json(members);
  } catch (error) {
    console.error('Get members error:', error);
    res.status(500).json({ error: 'Server error fetching members' });
  }
};

exports.addMember = async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const { email, role } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Find user by email
    const userToAdd = await prisma.user.findUnique({
      where: { email }
    });

    if (!userToAdd) {
      return res.status(404).json({ error: 'User with this email not found. They must register first.' });
    }

    // Check if already a member
    const existingMember = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: { projectId, userId: userToAdd.id }
      }
    });

    if (existingMember) {
      return res.status(400).json({ error: 'User is already a member of this project' });
    }

    const member = await prisma.projectMember.create({
      data: {
        projectId,
        userId: userToAdd.id,
        role: role === 'ADMIN' ? 'ADMIN' : 'MEMBER'
      },
      include: {
        user: { select: { id: true, name: true, email: true } }
      }
    });

    res.status(201).json(member);
  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({ error: 'Server error adding member' });
  }
};

exports.updateMemberRole = async (req, res) => {
  try {
    const { projectId, userId } = req.params;
    const { role } = req.body;

    if (!['ADMIN', 'MEMBER'].includes(role)) {
       return res.status(400).json({ error: 'Invalid role' });
    }
    
    // Prevent owner from changing their own role via this endpoint (owner is always admin implicitly)
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (project.ownerId === userId) {
        return res.status(400).json({ error: 'Cannot change the role of the project owner' });
    }

    const member = await prisma.projectMember.update({
      where: {
        projectId_userId: { projectId, userId }
      },
      data: { role },
      include: {
        user: { select: { id: true, name: true, email: true } }
      }
    });

    res.json(member);
  } catch (error) {
    console.error('Update member role error:', error);
    res.status(500).json({ error: 'Server error updating member role' });
  }
};

exports.removeMember = async (req, res) => {
  try {
    const { projectId, userId } = req.params;

    // Prevent owner from being removed
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (project.ownerId === userId) {
        return res.status(400).json({ error: 'Cannot remove the project owner' });
    }

    await prisma.projectMember.delete({
      where: {
        projectId_userId: { projectId, userId }
      }
    });
    
    // Optional: unassign tasks for this user in this project
    await prisma.task.updateMany({
        where: { projectId, assigneeId: userId },
        data: { assigneeId: null }
    });

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ error: 'Server error removing member' });
  }
};
