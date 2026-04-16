const express = require('express');
const router = express.Router();
const { 
    sendMessage, 
    getConversation, 
    getChatList 
} = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/list', getChatList);
router.post('/send', sendMessage);
router.get('/:userId', getConversation);

module.exports = router;
