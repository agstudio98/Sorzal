const Score = require('../models/Score');
const User = require('../models/User');

// @desc    Submit or update user score for a game
// @route   POST /api/scores
// @access  Private (Simulated with currentUserId for now)
const submitScore = async (req, res) => {
  const { userId, gameId, points } = req.body;

  try {
    // Buscar si ya tiene una puntuación en ese juego
    let score = await Score.findOne({ user: userId, gameId });

    if (score) {
      // Actualizar solo si la nueva puntuación es mayor (record)
      if (points > score.points) {
        score.points = points;
        await score.save();
      }
    } else {
      // Crear nueva puntuación
      score = await Score.create({
        user: userId,
        gameId,
        points,
      });
    }

    res.status(201).json(score);
  } catch (error) {
    res.status(500).json({ message: 'Error saving score' });
  }
};

// @desc    Get leaderboard for a specific game
// @route   GET /api/scores/:gameId
// @access  Public
const getLeaderboard = async (req, res) => {
  const { gameId } = req.params;

  try {
    const scores = await Score.find({ gameId })
      .populate('user', 'name avatar')
      .sort({ points: -1 })
      .limit(10); // Top 10

    res.json(scores);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching leaderboard' });
  }
};

module.exports = {
  submitScore,
  getLeaderboard,
};
