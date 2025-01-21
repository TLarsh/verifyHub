const express = require('express');
const { createUser, loginUserCtrl, getaUser, getallUsers, deleteaUser, updateaUser, blockUser, unblockUser, handleRefreshToken } = require('../controller/userCtrl');
const router = express.Router();
const { authMiddleware, isAdmin, } = require('../middlewares/authMiddleware');


router.post('/register', createUser);
router.post('/login', loginUserCtrl);
router.get('/refresh', handleRefreshToken);
router.get('/get-users', authMiddleware, getallUsers);
router.get('/:id', authMiddleware, isAdmin,getaUser);
router.delete('/:id', deleteaUser);
router.put('/edit', authMiddleware, updateaUser);
router.put('/block/:id', authMiddleware, isAdmin, blockUser);
router.put('/unblock/:id', authMiddleware, isAdmin, unblockUser);

module.exports = router;


