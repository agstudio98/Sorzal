const express = require('express');
const router = express.Router();
const { submitScore, getLeaderboard } = require('../controllers/scoreController');

router.post('/', submitScore);
router.get('/:gameId', getLeaderboard);

module.exports = router;
