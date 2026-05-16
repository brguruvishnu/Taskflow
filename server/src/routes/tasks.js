const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const authenticateToken = require('../middleware/auth');
const { isMember, isAdmin } = require('../middleware/roleCheck');

router.use(authenticateToken);

// All task routes are scoped under /projects/:projectId/tasks
// The projectId is handled via a param hack or by using mergeParams.
// To keep it simple in app.js, we will use /api/tasks/:projectId
// But a better REST way is /api/projects/:projectId/tasks. Let's stick to /api/projects/:projectId/tasks approach
// We'll export a router that takes mergeParams: true
const taskRouter = express.Router({ mergeParams: true });

taskRouter.get('/', isMember, taskController.getTasks);
taskRouter.post('/', isMember, isAdmin, taskController.createTask);

taskRouter.get('/:taskId', isMember, taskController.getTaskDetails);
taskRouter.patch('/:taskId', isMember, taskController.updateTask); // Status update logic handles Member vs Admin inside controller
taskRouter.delete('/:taskId', isMember, isAdmin, taskController.deleteTask);

module.exports = taskRouter;
