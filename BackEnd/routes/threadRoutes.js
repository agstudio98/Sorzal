const express = require('express');
const router = express.Router();
const {
  getThreads,
  getThreadById,
  createThread,
  updateThread,
  deleteThread,
  voteThread,
  addThreadComment,
  updateThreadComment,
  deleteThreadComment,
  voteThreadComment
} = require('../controllers/threadController');

router.route('/').get(getThreads).post(createThread);
router.route('/:id').get(getThreadById).put(updateThread).delete(deleteThread);
router.route('/:id/vote').post(voteThread);
router.route('/:id/comments').post(addThreadComment);
router.route('/:id/comments/:commentId').put(updateThreadComment).delete(deleteThreadComment);
router.route('/:id/comments/:commentId/vote').post(voteThreadComment);

module.exports = router;
