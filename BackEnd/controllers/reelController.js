const Reel = require('../models/Reel');
const ReelComment = require('../models/ReelComment');

const getReels = async (req, res) => {
  try {
    const reels = await Reel.find({})
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .lean();
    
    // For each reel, get comment count efficiently
    const reelsWithData = await Promise.all(reels.map(async (reel) => {
      const commentsCount = await ReelComment.countDocuments({ reel: reel._id });
      return { ...reel, commentsCount };
    }));

    res.json(reelsWithData || []);
  } catch (error) {
    console.error('Error fetching reels:', error);
    res.status(500).json({ message: 'Error fetching reels', error: error.message });
  }
};

const createReel = async (req, res) => {
  const { userId, videoUrl, caption, song, trimStart, trimEnd, textOverlays } = req.body;
  try {
    const reel = await Reel.create({
      user: userId,
      videoUrl,
      caption,
      song,
      trimStart: Number(trimStart) || 0,
      trimEnd: trimEnd ? Number(trimEnd) : undefined,
      textOverlays: textOverlays || []
    });
    const populated = await reel.populate('user', 'name avatar');
    res.status(201).json(populated);
  } catch (error) {
    console.error('Error creating reel:', error);
    res.status(500).json({ message: 'Error creating reel' });
  }
};

const toggleLikeReel = async (req, res) => {
  const { userId } = req.body;
  try {
    const reel = await Reel.findById(req.params.id);
    if (!reel) return res.status(404).json({ message: 'Reel not found' });

    const isLiked = reel.likes.includes(userId);
    if (isLiked) {
      reel.likes = reel.likes.filter(id => id.toString() !== userId);
    } else {
      reel.likes.push(userId);
    }

    await reel.save();
    res.json({ likes: reel.likes });
  } catch (error) {
    res.status(500).json({ message: 'Error liking reel' });
  }
};

const getReelComments = async (req, res) => {
  try {
    const comments = await ReelComment.find({ reel: req.params.id })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching comments' });
  }
};

const addReelComment = async (req, res) => {
  const { userId, content } = req.body;
  try {
    const comment = await ReelComment.create({
      user: userId,
      reel: req.params.id,
      content
    });
    const populated = await comment.populate('user', 'name avatar');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Error adding comment' });
  }
};

const shareReel = async (req, res) => {
  try {
    const reel = await Reel.findByIdAndUpdate(req.params.id, { $inc: { sharesCount: 1 } }, { new: true });
    res.json({ sharesCount: reel.sharesCount });
  } catch (error) {
    res.status(500).json({ message: 'Error sharing reel' });
  }
};

module.exports = {
  getReels,
  createReel,
  toggleLikeReel,
  getReelComments,
  addReelComment,
  shareReel
};
