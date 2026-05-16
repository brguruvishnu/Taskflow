const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const authenticateToken = require('../middleware/auth');
const { isMember, isAdmin } = require('../middleware/roleCheck');

// All project routes require authentication
router.use(authenticateToken);

router.post('/', projectController.createProject);
router.get('/', projectController.getProjects);

// Routes requiring specific project membership/roles
router.get('/:id', isMember, projectController.getProjectDetails);
router.patch('/:id', isMember, isAdmin, projectController.updateProject);
router.delete('/:id', isMember, isAdmin, projectController.deleteProject);

module.exports = router;
