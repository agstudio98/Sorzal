const Thread = require('../models/Thread');
const ThreadComment = require('../models/ThreadComment');

const getThreads = async (req, res) => {
  try {
    const keyword = req.query.keyword;
    const category = req.query.category;
    
    let query = {};
    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { content: { $regex: keyword, $options: 'i' } }
      ];
    }
    if (category && category !== 'Todos') {
      query.category = category;
    }

    const threads = await Thread.find(query)
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });

    res.json(threads);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching threads' });
  }
};

const createThread = async (req, res) => {
  const { userId, title, content, category } = req.body;
  try {
    const thread = await Thread.create({
      user: userId,
      title,
      content,
      category,
    });
    const populated = await thread.populate('user', 'name avatar');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Error creating thread' });
  }
};

const getThreadById = async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.id).populate('user', 'name avatar');
    if (!thread) return res.status(404).json({ message: 'Thread not found' });
    
    const comments = await ThreadComment.find({ thread: req.params.id })
      .populate('user', 'name avatar')
      .sort({ createdAt: 1 });
      
    res.json({ thread, comments });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching thread' });
  }
};

const voteThread = async (req, res) => {
  const { userId, vote } = req.body;
  try {
    const thread = await Thread.findById(req.params.id);
    if (!thread) return res.status(404).json({ message: 'Thread not found' });

    thread.upvotes = thread.upvotes.filter(id => id.toString() !== userId);
    thread.downvotes = thread.downvotes.filter(id => id.toString() !== userId);

    if (vote === 1) {
      thread.upvotes.push(userId);
    } else if (vote === -1) {
      thread.downvotes.push(userId);
    }

    await thread.save();
    res.json({ upvotes: thread.upvotes, downvotes: thread.downvotes });
  } catch (error) {
    res.status(500).json({ message: 'Error voting' });
  }
};

const deleteThread = async (req, res) => {
  const { userId } = req.body;
  try {
    const thread = await Thread.findById(req.params.id);
    if (!thread) return res.status(404).json({ message: 'Thread not found' });
    if (thread.user.toString() !== userId) return res.status(401).json({ message: 'Unauthorized' });

    await ThreadComment.deleteMany({ thread: thread._id });
    await thread.deleteOne();
    res.json({ message: 'Thread removed' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting thread' });
  }
};

const updateThread = async (req, res) => {
  const { userId, title, content, category } = req.body;
  try {
    const thread = await Thread.findById(req.params.id);
    if (!thread) return res.status(404).json({ message: 'Thread not found' });
    if (thread.user.toString() !== userId) return res.status(401).json({ message: 'Unauthorized' });

    thread.title = title || thread.title;
    thread.content = content || thread.content;
    thread.category = category || thread.category;
    
    await thread.save();
    const populated = await thread.populate('user', 'name avatar');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Error updating thread' });
  }
};

const addThreadComment = async (req, res) => {
  const { userId, content, parentComment } = req.body;
  try {
    const comment = await ThreadComment.create({
      user: userId,
      thread: req.params.id,
      parentComment: parentComment || null,
      content,
    });
    
    await Thread.findByIdAndUpdate(req.params.id, { $inc: { repliesCount: 1 } });
    
    const populated = await comment.populate('user', 'name avatar');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Error adding comment' });
  }
};

const voteThreadComment = async (req, res) => {
  const { userId, vote } = req.body;
  try {
    const comment = await ThreadComment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    comment.upvotes = comment.upvotes.filter(id => id.toString() !== userId);
    comment.downvotes = comment.downvotes.filter(id => id.toString() !== userId);

    if (vote === 1) {
      comment.upvotes.push(userId);
    } else if (vote === -1) {
      comment.downvotes.push(userId);
    }

    await comment.save();
    res.json({ upvotes: comment.upvotes, downvotes: comment.downvotes });
  } catch (error) {
    res.status(500).json({ message: 'Error voting on comment' });
  }
};

const updateThreadComment = async (req, res) => {
  const { userId, content } = req.body;
  try {
    const comment = await ThreadComment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    if (comment.user.toString() !== userId) return res.status(401).json({ message: 'Unauthorized' });

    comment.content = content;
    await comment.save();
    const populated = await comment.populate('user', 'name avatar');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Error updating comment' });
  }
};

const deleteThreadComment = async (req, res) => {
  const { userId } = req.body;
  try {
    const comment = await ThreadComment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    if (comment.user.toString() !== userId) return res.status(401).json({ message: 'Unauthorized' });

    await Thread.findByIdAndUpdate(comment.thread, { $inc: { repliesCount: -1 } });

    await comment.deleteOne();
    res.json({ message: 'Comment removed' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting comment' });
  }
};

module.exports = {
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
};
