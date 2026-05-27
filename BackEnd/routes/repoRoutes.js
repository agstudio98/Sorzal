const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
  getRepos,
  getRepoById,
  createRepo,
  updateRepo,
  deleteRepo,
  toggleStarRepo,
  getRepoComments,
  addRepoComment,
  deleteRepoComment,
  updateRepoComment
} = require('../controllers/repoController');

// Multer Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/repos/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

router.get('/', getRepos);
router.get('/:id', getRepoById);
router.post('/', upload.single('file'), createRepo);
router.put('/:id', upload.single('file'), updateRepo);
router.delete('/:id', deleteRepo);
router.post('/:id/star', toggleStarRepo);
router.get('/:id/comments', getRepoComments);
router.post('/:id/comments', addRepoComment);
router.put('/comments/:commentId', updateRepoComment);
router.delete('/comments/:commentId', deleteRepoComment);

module.exports = router;
