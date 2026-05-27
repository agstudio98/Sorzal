const express = require('express');
const router = express.Router();
const {
  getPosts,
  createPost,
  toggleLikePost,
  addPostComment
} = require('../controllers/postController');

router.get('/', getPosts);
router.post('/', createPost);
router.post('/:id/like', toggleLikePost);
router.post('/:id/comments', addPostComment);

module.exports = router;
