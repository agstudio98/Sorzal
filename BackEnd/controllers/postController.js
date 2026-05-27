const Post = require('../models/Post');
const logger = require('../utils/logger');

// @desc    Get all posts
const getPosts = async (req, res) => {
  try {
    const posts = await Post.find({})
      .populate('user', 'name avatar')
      .populate('comments.user', 'name avatar')
      .populate('referenceId')
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    logger.error(`Error fetching posts: ${error.message}`);
    res.status(500).json({ message: 'Error fetching posts' });
  }
};

// @desc    Create a post
const createPost = async (req, res) => {
  const { userId, content, type, referenceId, referenceModel, mediaUrl } = req.body;
  try {
    const post = await Post.create({
      user: userId,
      content,
      type: type || 'text',
      referenceId,
      referenceModel,
      mediaUrl
    });
    const populated = await post.populate('user', 'name avatar');
    res.status(201).json(populated);
  } catch (error) {
    logger.error(`Error creating post: ${error.message}`);
    res.status(500).json({ message: 'Error creating post' });
  }
};

// @desc    Toggle Like on post
const toggleLikePost = async (req, res) => {
  const { userId } = req.body;
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const alreadyLiked = post.likes.includes(userId);
    if (alreadyLiked) {
      post.likes = post.likes.filter(id => id.toString() !== userId);
    } else {
      post.likes.push(userId);
    }
    await post.save();
    res.json({ likes: post.likes });
  } catch (error) {
    logger.error(`Error toggling like: ${error.message}`);
    res.status(500).json({ message: 'Error toggling like' });
  }
};

// @desc    Add comment to post
const addPostComment = async (req, res) => {
  const { userId, content } = req.body;
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    post.comments.push({ user: userId, content });
    await post.save();
    
    const updatedPost = await Post.findById(req.params.id)
      .populate('user', 'name avatar')
      .populate('comments.user', 'name avatar');
      
    res.status(201).json(updatedPost);
  } catch (error) {
    logger.error(`Error adding comment: ${error.message}`);
    res.status(500).json({ message: 'Error adding comment' });
  }
};

const purgeIncompletePosts = async () => {
  try {
    // Skip automatic purge to preserve AI content
    logger.info('Post cleanup skipped to preserve AI content.');
  } catch (error) {
    logger.error(`Error during post cleanup: ${error.message}`);
  }
};

module.exports = {
  getPosts,
  createPost,
  toggleLikePost,
  addPostComment,
  purgeIncompletePosts
};
