const prisma = require('../prismaClient');

exports.createProject = async (req, res) => {
  try {
    const { name, description } = req.body;
    const userId = req.user.id;
    const globalRole = req.user.globalRole;

    if (globalRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Only Global Admins can create new projects' });
    }

    if (!name) {
      return res.status(400).json({ error: 'Project name is required' });
    }

    const project = await prisma.project.create({
      data: {
        name,
        description,
        ownerId: userId,
        members: {
          create: {
            userId: userId,
            role: 'ADMIN' // Owner is automatically an admin
          }
        }
      }
    });

    res.status(201).json(project);
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Server error creating project' });
  }
};

exports.getProjects = async (req, res) => {
  try {
    const userId = req.user.id;

    const projects = await prisma.project.findMany({
      where: {
        members: {
          some: { userId }
        }
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: {
          where: { userId },
          select: { role: true }
        },
        _count: {
          select: { tasks: true, members: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(projects);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Server error fetching projects' });
  }
};

exports.getProjectDetails = async (req, res) => {
  try {
    const projectId = req.params.id;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: {
          include: {
            user: { select: { id: true, name: true, email: true } }
          }
        }
      }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    console.error('Get project details error:', error);
    res.status(500).json({ error: 'Server error fetching project details' });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    const { name, description } = req.body;

    const project = await prisma.project.update({
      where: { id: projectId },
      data: { name, description }
    });

    res.json(project);
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ error: 'Server error updating project' });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const projectId = req.params.id;

    await prisma.project.delete({
      where: { id: projectId }
    });

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ error: 'Server error deleting project' });
  }
};
