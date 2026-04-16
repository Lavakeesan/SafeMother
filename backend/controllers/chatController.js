const Message = require('../models/messageModel');
const User = require('../models/userModel');

// @desc    Send a message
// @route   POST /api/chat/send
// @access  Private
const sendMessage = async (req, res) => {
    try {
        const { receiverId, message, attachment } = req.body;
        
        if (!message && !attachment) {
            return res.status(400).json({ message: 'Cannot send empty message' });
        }

        const newMessage = await Message.create({
            sender: req.user._id,
            receiver: receiverId,
            message,
            attachment
        });

        const populatedMessage = await Message.findById(newMessage._id).populate('sender', 'name role');

        res.status(201).json(populatedMessage);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get conversation between two users
// @route   GET /api/chat/:userId
// @access  Private
const getConversation = async (req, res) => {
    try {
        const otherUserId = req.params.userId;
        const currentUserId = req.user._id;

        const messages = await Message.find({
            $or: [
                { sender: currentUserId, receiver: otherUserId },
                { sender: otherUserId, receiver: currentUserId }
            ]
        }).sort({ createdAt: 1 });

        // Mark unread messages as read
        await Message.updateMany(
            { sender: otherUserId, receiver: currentUserId, read: false },
            { $set: { read: true } }
        );

        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all unique users current user has chatted with
// @route   GET /api/chat/list
// @access  Private
const getChatList = async (req, res) => {
    try {
        const userId = req.user._id;

        // Find all messages involving the current user
        const messages = await Message.find({
            $or: [{ sender: userId }, { receiver: userId }]
        }).sort({ createdAt: -1 });

        const chattedUserIds = new Set();
        const chatList = [];

        for (const msg of messages) {
            const otherUserId = msg.sender.toString() === userId.toString() ? msg.receiver : msg.sender;
            
            if (!chattedUserIds.has(otherUserId.toString())) {
                chattedUserIds.add(otherUserId.toString());
                
                const otherUser = await User.findById(otherUserId).select('name role email');
                if (otherUser) {
                    chatList.push({
                        user: otherUser,
                        lastMessage: msg.message,
                        lastMessageTime: msg.createdAt,
                        unreadCount: await Message.countDocuments({
                            sender: otherUserId,
                            receiver: userId,
                            read: false
                        })
                    });
                }
            }
        }

        res.json(chatList);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    sendMessage,
    getConversation,
    getChatList
};
