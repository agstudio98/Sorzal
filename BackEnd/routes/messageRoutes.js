const express = require('express');
const router = express.Router();
const { 
  sendMessage, 
  getMessages, 
  getConversations 
} = require('../controllers/messageController');

router.post('/', sendMessage);
router.get('/conversations/:userId', getConversations);
router.get('/:userId/:otherId', getMessages);

module.exports = router;
