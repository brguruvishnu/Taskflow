const prisma = require('../prismaClient');

exports.createTask = async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const { title, description, assigneeId, dueDate } = req.body;
    const creatorId = req.user.id;

    if (!title) {
      return res.status(400).json({ error: 'Task title is required' });
    }

    // Assignee validation: check if assignee is a member of the project
    if (assigneeId) {
      const member = await prisma.projectMember.findUnique({
        where: {
          projectId_userId: { projectId, userId: assigneeId }
        }
      });
      if (!member) {
        return res.status(400).json({ error: 'Assignee is not a member of this project' });
      }
    }

    const task = await prisma.task.create({
      data: {
        projectId,
        title,
        description,
        assigneeId,
        creatorId,
        dueDate: dueDate ? new Date(dueDate) : null
      },
      include: {
        assignee: { select: { id: true, name: true } },
        creator: { select: { id: true, name: true } }
      }
    });

    res.status(201).json(task);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Server error creating task' });
  }
};

exports.getTasks = async (req, res) => {
  try {
    const projectId = req.params.projectId;

    const tasks = await prisma.task.findMany({
      where: { projectId },
      include: {
        assignee: { select: { id: true, name: true } },
        creator: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Server error fetching tasks' });
  }
};

exports.getTaskDetails = async (req, res) => {
  try {
    const { projectId, taskId } = req.params;

    const task = await prisma.task.findFirst({
      where: { id: taskId, projectId },
      include: {
        assignee: { select: { id: true, name: true } },
        creator: { select: { id: true, name: true } }
      }
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    console.error('Get task details error:', error);
    res.status(500).json({ error: 'Server error fetching task details' });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { projectId, taskId } = req.params;
    const { title, description, status, assigneeId, dueDate } = req.body;
    const userId = req.user.id;
    const role = req.projectRole;

    const existingTask = await prisma.task.findFirst({
      where: { id: taskId, projectId }
    });

    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Members can only update status of their own tasks, Admins can update anything
    if (role !== 'ADMIN') {
      if (existingTask.assigneeId !== userId) {
         return res.status(403).json({ error: 'Members can only update their assigned tasks' });
      }
      
      // Prevent members from changing anything other than status
      if (title || description || assigneeId || dueDate) {
         return res.status(403).json({ error: 'Members can only update task status' });
      }
    }

    // Assignee validation for Admin updates
    if (role === 'ADMIN' && assigneeId && assigneeId !== existingTask.assigneeId) {
      const member = await prisma.projectMember.findUnique({
        where: {
          projectId_userId: { projectId, userId: assigneeId }
        }
      });
      if (!member) {
        return res.status(400).json({ error: 'Assignee is not a member of this project' });
      }
    }

    const task = await prisma.task.update({
      where: { id: taskId },
      data: {
        title: role === 'ADMIN' ? title : undefined,
        description: role === 'ADMIN' ? description : undefined,
        status,
        assigneeId: role === 'ADMIN' ? assigneeId : undefined,
        dueDate: role === 'ADMIN' && dueDate ? new Date(dueDate) : undefined
      },
      include: {
        assignee: { select: { id: true, name: true } }
      }
    });

    res.json(task);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Server error updating task' });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const { projectId, taskId } = req.params;

    // Verify task exists in this project
    const existingTask = await prisma.task.findFirst({
       where: { id: taskId, projectId }
    });

    if (!existingTask) {
       return res.status(404).json({ error: 'Task not found' });
    }

    await prisma.task.delete({
      where: { id: taskId }
    });

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Server error deleting task' });
  }
};
