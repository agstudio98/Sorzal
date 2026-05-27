const Repo = require('../models/Repo');
const RepoComment = require('../models/RepoComment');
const fs = require('fs');
const path = require('path');

// @desc    Get all repos
const getRepos = async (req, res) => {
  try {
    const repos = await Repo.find({}).populate('user', 'name avatar').sort({ createdAt: -1 });
    res.json(repos);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching repos' });
  }
};

// @desc    Get repo by ID
const getRepoById = async (req, res) => {
  try {
    const repo = await Repo.findById(req.params.id).populate('user', 'name avatar');
    if (repo) res.json(repo);
    else res.status(404).json({ message: 'Repo not found' });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching repo' });
  }
};

// @desc    Create a new repo
const createRepo = async (req, res) => {
  try {
    const { title, description, language, userId } = req.body;
    if (!req.file) return res.status(400).json({ message: 'Please upload a file' });

    const repo = await Repo.create({
      title,
      description,
      language,
      fileUrl: `/uploads/repos/${req.file.filename}`,
      fileName: req.file.originalname,
      size: req.file.size,
      user: userId
    });

    const populated = await repo.populate('user', 'name avatar');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Error creating repo' });
  }
};

// @desc    Update a repo
const updateRepo = async (req, res) => {
  try {
    const { title, description, language, userId } = req.body;
    const repo = await Repo.findById(req.params.id);

    if (!repo) return res.status(404).json({ message: 'Repo not found' });
    if (!repo.user || repo.user.toString() !== userId) return res.status(401).json({ message: 'Unauthorized' });

    repo.title = title || repo.title;
    repo.description = description || repo.description;
    repo.language = language || repo.language;

    if (req.file) {
      // Delete old file
      const oldPath = path.join(__dirname, '..', repo.fileUrl);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);

      repo.fileUrl = `/uploads/repos/${req.file.filename}`;
      repo.fileName = req.file.originalname;
      repo.size = req.file.size;
    }

    await repo.save();
    const populated = await repo.populate('user', 'name avatar');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Error updating repo' });
  }
};

// @desc    Delete a repo
const deleteRepo = async (req, res) => {
  try {
    const { userId } = req.body;
    const repo = await Repo.findById(req.params.id);

    if (!repo) return res.status(404).json({ message: 'Repo not found' });
    if (!repo.user || repo.user.toString() !== userId) return res.status(401).json({ message: 'Unauthorized' });

    // Delete file
    const filePath = path.join(__dirname, '..', repo.fileUrl);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    // Delete comments
    await RepoComment.deleteMany({ repo: repo._id });

    await repo.deleteOne();
    res.json({ message: 'Repo removed' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting repo' });
  }
};

// @desc    Toggle Star on repo
const toggleStarRepo = async (req, res) => {
  const { userId } = req.body;
  try {
    const repo = await Repo.findById(req.params.id);
    if (!repo) return res.status(404).json({ message: 'Repo not found' });

    const alreadyStarred = repo.starUsers.includes(userId);
    if (alreadyStarred) {
      repo.starUsers = repo.starUsers.filter(id => id.toString() !== userId);
    } else {
      repo.starUsers.push(userId);
    }
    repo.stars = repo.starUsers.length;
    await repo.save();
    res.json({ stars: repo.stars, starUsers: repo.starUsers });
  } catch (error) {
    res.status(500).json({ message: 'Error toggling star' });
  }
};

// @desc    Get comments for a repo
const getRepoComments = async (req, res) => {
  try {
    const comments = await RepoComment.find({ repo: req.params.id })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching comments' });
  }
};

// @desc    Add comment to repo
const addRepoComment = async (req, res) => {
  const { userId, content } = req.body;
  try {
    const repo = await Repo.findById(req.params.id);
    if (!repo) return res.status(404).json({ message: 'Repo not found' });

    const comment = await RepoComment.create({
      user: userId,
      repo: req.params.id,
      content
    });

    const populated = await comment.populate('user', 'name avatar');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Error adding comment' });
  }
};

// @desc    Delete a comment
const deleteRepoComment = async (req, res) => {
  const { userId } = req.body;
  try {
    const comment = await RepoComment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    if (comment.user.toString() !== userId) return res.status(401).json({ message: 'Unauthorized' });

    await comment.deleteOne();
    res.json({ message: 'Comment removed' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting comment' });
  }
};

// @desc    Update a comment
const updateRepoComment = async (req, res) => {
  const { userId, content } = req.body;
  try {
    const comment = await RepoComment.findById(req.params.commentId);
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

module.exports = {
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
};
