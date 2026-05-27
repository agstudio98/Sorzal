const Podcast = require('../models/Podcast');

// @desc    Get all podcasts with search, category filters and pagination
const getPodcasts = async (req, res) => {
  try {
    const pageSize = 12;
    const page = Number(req.query.pageNumber) || 1;
    const { keyword, category, favorites, userId } = req.query;
    let query = {};

    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
        { host: { $regex: keyword, $options: 'i' } }
      ];
    }

    if (category && category !== 'Todos') {
      query.category = category;
    }

    if (favorites === 'true' && userId) {
      query.likes = userId;
    }

    const count = await Podcast.countDocuments(query);
    const podcasts = await Podcast.find(query)
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.json({ podcasts, page, pages: Math.ceil(count / pageSize), total: count });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching podcasts' });
  }
};

// @desc    Create a new podcast
const createPodcast = async (req, res) => {
  try {
    const { title, description, host, category, duration, userId } = req.body;
    if (!req.file) return res.status(400).json({ message: 'Please upload an audio file' });

    const podcast = await Podcast.create({
      title,
      description,
      host,
      category,
      duration,
      audioUrl: `/uploads/podcasts/${req.file.filename}`,
      imageUrl: `https://picsum.photos/seed/${Date.now()}/600/600`, // Placeholder image for now
      user: userId
    });

    res.status(201).json(podcast);
  } catch (error) {
    res.status(500).json({ message: 'Error creating podcast' });
  }
};

// @desc    Update a podcast
const updatePodcast = async (req, res) => {
  try {
    const { title, description, host, category, duration, userId } = req.body;
    const podcast = await Podcast.findById(req.params.id);

    if (!podcast) return res.status(404).json({ message: 'Podcast not found' });
    if (podcast.user.toString() !== userId) return res.status(401).json({ message: 'Unauthorized' });

    podcast.title = title || podcast.title;
    podcast.description = description || podcast.description;
    podcast.host = host || podcast.host;
    podcast.category = category || podcast.category;
    podcast.duration = duration || podcast.duration;

    await podcast.save();
    res.json(podcast);
  } catch (error) {
    res.status(500).json({ message: 'Error updating podcast' });
  }
};

// @desc    Delete a podcast
const deletePodcast = async (req, res) => {
  try {
    const { userId } = req.body;
    const podcast = await Podcast.findById(req.params.id);

    if (!podcast) return res.status(404).json({ message: 'Podcast not found' });
    if (podcast.user.toString() !== userId) return res.status(401).json({ message: 'Unauthorized' });

    // Delete file
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(__dirname, '..', podcast.audioUrl);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await podcast.deleteOne();
    res.json({ message: 'Podcast removed' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting podcast' });
  }
};

// @desc    Toggle Like on podcast
const toggleLikePodcast = async (req, res) => {
  const { userId } = req.body;
  try {
    const podcast = await Podcast.findById(req.params.id);
    if (!podcast) return res.status(404).json({ message: 'Podcast not found' });

    const alreadyLiked = podcast.likes.includes(userId);
    if (alreadyLiked) {
      podcast.likes = podcast.likes.filter(id => id.toString() !== userId);
    } else {
      podcast.likes.push(userId);
    }
    await podcast.save();
    res.json({ likes: podcast.likes });
  } catch (error) {
    res.status(500).json({ message: 'Error toggling like' });
  }
};

module.exports = {
  getPodcasts,
  toggleLikePodcast,
  createPodcast,
  updatePodcast,
  deletePodcast
};
