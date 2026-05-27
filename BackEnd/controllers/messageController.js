const Message = require('../models/Message');
const User = require('../models/User');
const Groq = require('groq-sdk');
const logger = require('../utils/logger');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || 'dummy_key',
});

// @desc    Send a message
const sendMessage = async (req, res) => {
  try {
    const { senderId, receiverId, content } = req.body;

    if (!senderId || !receiverId || !content) {
      return res.status(400).json({ message: 'Missing fields' });
    }

    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);

    if (!sender || !receiver) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Restriction: Only chat with followed or matches
    const isFollowing = sender.following.includes(receiverId);
    const isMatch = sender.matches.includes(receiverId);
    
    if (!isFollowing && !isMatch && !receiver.isAI) {
      return res.status(403).json({ message: 'You can only chat with users you follow or match with' });
    }

    const message = await Message.create({
      sender: senderId,
      receiver: receiverId,
      content
    });

    // If receiver is AI, trigger response
    if (receiver.isAI) {
      logger.debug(`Triggering AI response for receiver: ${receiver.name}`);
      const apiKey = process.env.GROQ_API_KEY;
      
      setTimeout(async () => {
        try {
          if (!apiKey || apiKey === 'tu_clave_aqui_mismo' || apiKey === 'dummy_key') {
             throw new Error('GROQ_API_KEY not configured');
          }

          logger.debug('Calling Groq with model llama-3.3-70b-versatile...');
          const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: `You are a real person named ${receiver.name}. Personality: ${receiver.aiPersona || 'A friendly person on a social network.'} Keep responses brief, realistic and in Spanish.` },
                { role: "user", content: content }
            ],
            model: "llama-3.3-70b-versatile",
          });

          const aiContent = chatCompletion.choices[0].message.content;
          logger.debug('Groq response received successfully');

          await Message.create({
            sender: receiverId,
            receiver: senderId,
            content: aiContent
          });
        } catch (error) {
          logger.error(`AI Error (Groq): ${error.message}`);
          
          await Message.create({
            sender: receiverId,
            receiver: senderId,
            content: `Hi! I'm ${receiver.name}. I'd love to chat, but I need my brain (GROQ_API_KEY) configured correctly.`
          });
        }
      }, 500);
    }

    res.status(201).json(message);
  } catch (error) {
    logger.error(`Error in sendMessage: ${error.message}`);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get messages between two users
const getMessages = async (req, res) => {
  try {
    const { userId, otherId } = req.params;

    let messages = await Message.find({
      $or: [
        { sender: userId, receiver: otherId },
        { sender: otherId, receiver: userId }
      ]
    }).sort({ createdAt: 1 });

    if (messages.length === 0) {
      const otherUser = await User.findById(otherId);
      if (otherUser && otherUser.email === 'bot@sorzal.com') {
        const welcomeMsg = await Message.create({
          sender: otherId,
          receiver: userId,
          content: 'What problem do you have today? I am the Sorzal assistant and I am here to help you.'
        });
        messages = [welcomeMsg];
      }
    }

    res.json(messages);
  } catch (error) {
    logger.error(`Error in getMessages: ${error.message}`);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all conversations for a user
const getConversations = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId).populate('following matches');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const aiUsers = await User.find({ isAI: true });

    const following = Array.isArray(user.following) ? user.following : [];
    const matches = Array.isArray(user.matches) ? user.matches : [];
    const potentialChats = [...following, ...matches, ...aiUsers];
    
    const validPotentialChats = potentialChats.filter(u => u && u._id);
    const uniqueChats = Array.from(new Set(validPotentialChats.map(u => u._id.toString())))
      .map(id => validPotentialChats.find(u => u._id.toString() === id));

    const chatsWithLastMsg = await Promise.all(uniqueChats.map(async (u) => {
      const lastMsg = await Message.findOne({
        $or: [
          { sender: userId, receiver: u._id },
          { sender: u._id, receiver: userId }
        ]
      }).sort({ createdAt: -1 });

      return {
        _id: u._id,
        name: u.name,
        avatar: u.avatar,
        isAI: u.isAI,
        isMatch: user.matches.some(m => m._id.toString() === u._id.toString()),
        lastMsg: lastMsg ? lastMsg.content : 'No messages yet',
        time: lastMsg ? lastMsg.createdAt : u.createdAt,
        online: u.isAI ? true : false
      };
    }));

    res.json(chatsWithLastMsg);
  } catch (error) {
    logger.error(`Error in getConversations: ${error.message}`);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  sendMessage,
  getMessages,
  getConversations
};
