const express = require('express');
const router = express.Router();
const { registerUser, authUser, logoutUser, updateUserProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', registerUser);
router.post('/login', authUser);
router.post('/logout', logoutUser);
router.put('/profile', protect, updateUserProfile);

module.exports = router;
