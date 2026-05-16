const prisma = require('../prismaClient');

exports.getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Total projects user is a member of
    const totalProjects = await prisma.projectMember.count({
      where: { userId }
    });

    // 2. Task stats for user
    const tasks = await prisma.task.findMany({
      where: { assigneeId: userId }
    });

    const totalTasks = tasks.length;
    const todoTasks = tasks.filter(t => t.status === 'TODO').length;
    const inProgressTasks = tasks.filter(t => t.status === 'IN_PROGRESS').length;
    const doneTasks = tasks.filter(t => t.status === 'DONE').length;
    
    // 3. Overdue tasks
    const now = new Date();
    const overdueTasks = tasks.filter(t => t.status !== 'DONE' && t.dueDate && new Date(t.dueDate) < now);

    res.json({
      stats: {
        totalProjects,
        totalTasks,
        todoTasks,
        inProgressTasks,
        doneTasks,
        overdueCount: overdueTasks.length
      },
      recentTasks: tasks.slice(0, 5), // Return a few recent assigned tasks
      overdueTasks
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ error: 'Server error fetching dashboard data' });
  }
};
