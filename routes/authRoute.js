const express = require('express');
const { createUser, loginUserCtrl, getaUser, getallUsers, deleteaUser, updateaUser, deactivateUser, activateUser, handleRefreshToken } = require('../controller/userCtrl');
const router = express.Router();
const { authMiddleware, isAdmin, } = require('../middlewares/authMiddleware');


router.post('/register', createUser);
router.post('/login', loginUserCtrl);
router.get('/refresh', handleRefreshToken);
router.get('/get-users', authMiddleware, isAdmin, getallUsers);
router.get('/:id', authMiddleware, isAdmin,getaUser);
router.delete('/:id', deleteaUser);
router.put('/edit', authMiddleware, updateaUser);
router.put('/deactivate/:id', authMiddleware, isAdmin, deactivateUser);
router.put('/activate/:id', authMiddleware, isAdmin, activateUser);

module.exports = router;


