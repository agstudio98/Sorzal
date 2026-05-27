const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const {
  getReels,
  createReel,
  toggleLikeReel,
  getReelComments,
  addReelComment,
  shareReel
} = require('../controllers/reelController');

// Helper to handle video upload (we'll adapt the middleware below)
router.post('/upload', upload.single('video'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  res.json({ url: `/uploads/avatars/${req.file.filename}` }); // Using existing avatar dir for simplicity, but ideally separate
});

router.route('/').get(getReels).post(createReel);
router.route('/:id/like').post(toggleLikeReel);
router.route('/:id/share').post(shareReel);
router.route('/:id/comments').get(getReelComments).post(addReelComment);

module.exports = router;
