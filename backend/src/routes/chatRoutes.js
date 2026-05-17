const express = require('express');
const router = express.Router();
const { chatWithML } = require('../controllers/chatController');
const { requireAuth } = require('../middleware/authMiddleware'); // Reusing auth middleware

/**
 * @route   POST /api/chat
 * @desc    Chat with the ML assistant to find bookmarks
 * @access  Private
 */
router.post('/', requireAuth, chatWithML);

module.exports = router;
