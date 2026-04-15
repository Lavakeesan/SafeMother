const express = require('express');
const router = express.Router();
const { registerUser, authUser, logoutUser, getUserProfile, updateUserProfile, updatePassword, uploadProfilePhoto, getProfilePhoto, getAllUsers, updateUserByAdmin, deleteUser } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/', registerUser);
router.post('/login', authUser);
router.post('/logout', logoutUser);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.put('/update-password', protect, updatePassword);

// Admin Routes
router.get('/', protect, authorize('admin'), getAllUsers);
router.put('/:id', protect, authorize('admin'), updateUserByAdmin);
router.delete('/:id', protect, authorize('admin'), deleteUser);

router.post('/profile-photo', protect, upload.single('photo'), uploadProfilePhoto);
router.get('/profile-photo/:userId', getProfilePhoto);

module.exports = router;
