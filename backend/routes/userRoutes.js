const express = require('express');
const router = express.Router();
const { registerUser, authUser, logoutUser, getUserProfile, updateUserProfile, updatePassword, uploadProfilePhoto, getProfilePhoto } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/', registerUser);
router.post('/login', authUser);
router.post('/logout', logoutUser);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.put('/update-password', protect, updatePassword);

router.post('/profile-photo', protect, upload.single('photo'), uploadProfilePhoto);
router.get('/profile-photo/:userId', getProfilePhoto);

module.exports = router;
