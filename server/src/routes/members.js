const express = require('express');
const memberController = require('../controllers/memberController');
const authenticateToken = require('../middleware/auth');
const { isMember, isAdmin } = require('../middleware/roleCheck');

const memberRouter = express.Router({ mergeParams: true });
memberRouter.use(authenticateToken);

memberRouter.get('/', isMember, memberController.getMembers);
memberRouter.post('/', isMember, isAdmin, memberController.addMember);

memberRouter.patch('/:userId', isMember, isAdmin, memberController.updateMemberRole);
memberRouter.delete('/:userId', isMember, isAdmin, memberController.removeMember);

module.exports = memberRouter;
