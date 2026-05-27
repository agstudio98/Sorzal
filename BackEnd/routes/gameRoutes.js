const express = require('express');
const router = express.Router();
const Game = require('../models/Game');

// Get all games
router.get('/', async (req, res) => {
  try {
    const games = await Game.find().populate('user', 'name avatar');
    res.json(games);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Post a comment to a game
router.post('/:id/comments', async (req, res) => {
  try {
    const { userId, content } = req.body;
    const game = await Game.findById(req.params.id);
    if (!game) return res.status(404).json({ message: 'Game not found' });

    game.comments.push({ user: userId, content });
    await game.save();

    const updatedGame = await Game.findById(req.params.id).populate('comments.user', 'name avatar');
    res.json(updatedGame.comments[updatedGame.comments.length - 1]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
