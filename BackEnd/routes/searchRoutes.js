const express = require('express');
const User = require('../models/User');
const Product = require('../models/Product');
const router = express.Router();

// @desc    Global search
// @route   GET /api/search?q=...
// @access  Public
router.get('/', async (req, res) => {
  const query = req.query.q;
  if (!query) return res.json({ users: [], posts: [] });

  try {
    const searchRegex = new RegExp(query, 'i');

    const users = await User.find({
      $or: [
        { name: searchRegex },
        { email: searchRegex },
      ],
    }).select('name email avatar');

    const posts = await Product.find({
      $or: [
        { name: searchRegex },
        { description: searchRegex },
        { category: searchRegex },
      ],
    }).populate('user', 'name avatar');

    res.json({ users, posts });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
