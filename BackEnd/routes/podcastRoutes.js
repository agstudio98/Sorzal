const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { 
  getPodcasts, 
  toggleLikePodcast, 
  createPodcast, 
  updatePodcast, 
  deletePodcast 
} = require('../controllers/podcastController');

// Multer Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/podcasts/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB for audio
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'), false);
    }
  }
});

router.get('/', getPodcasts);
router.post('/', upload.single('audio'), createPodcast);
router.put('/:id', updatePodcast);
router.delete('/:id', deletePodcast);
router.post('/:id/like', toggleLikePodcast);

module.exports = router;
