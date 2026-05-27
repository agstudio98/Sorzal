const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { 
  loginUser, 
  registerUser, 
  getUserProfile, 
  followUser,
  getPotentialMatches,
  likeUser,
  dislikeUser,
  updateUserProfile,
  uploadAvatar,
  addPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
  changePassword,
  updateInterests,
  updateAffinities
} = require('../controllers/userController');

router.post('/', registerUser);
router.post('/login', loginUser);
router.get('/support-bot', async (req, res) => {
  try {
    const User = require('../models/User');
    const bot = await User.findOne({ email: 'bot@sorzal.com' });
    if (!bot) return res.status(404).json({ message: 'Support Bot not found' });
    res.json(bot);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});
router.get('/discover', getPotentialMatches);
router.post('/like/:id', likeUser);
router.post('/dislike/:id', dislikeUser);
router.get('/:id', getUserProfile);
router.post('/follow/:id', followUser);
router.put('/profile', updateUserProfile);
router.post('/upload-avatar', upload.single('avatar'), uploadAvatar);
router.post('/payment-methods', addPaymentMethod);
router.put('/payment-methods/:methodId', updatePaymentMethod);
router.delete('/payment-methods/:methodId', deletePaymentMethod);
router.put('/change-password', changePassword);
router.put('/interests', updateInterests);
router.put('/affinities', updateAffinities);

module.exports = router;
