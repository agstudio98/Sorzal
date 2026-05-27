const express = require('express');
const router = express.Router();

// Import all route modules
const productRoutes = require('./productRoutes');
const userRoutes = require('./userRoutes');
const orderRoutes = require('./orderRoutes');
const supportRoutes = require('./supportRoutes');
const searchRoutes = require('./searchRoutes');
const scoreRoutes = require('./scoreRoutes');
const threadRoutes = require('./threadRoutes');
const reelRoutes = require('./reelRoutes');
const repoRoutes = require('./repoRoutes');
const postRoutes = require('./postRoutes');
const podcastRoutes = require('./podcastRoutes');
const courseRoutes = require('./courseRoutes');
const messageRoutes = require('./messageRoutes');
const gameRoutes = require('./gameRoutes');

/**
 * Main API Router
 * Versioning can be added here (e.g., router.use('/v1', ...))
 */

router.use('/products', productRoutes);
router.use('/users', userRoutes);
router.use('/orders', orderRoutes);
router.use('/support', supportRoutes);
router.use('/search', searchRoutes);
router.use('/scores', scoreRoutes);
router.use('/threads', threadRoutes);
router.use('/reels', reelRoutes);
router.use('/repos', repoRoutes);
router.use('/posts', postRoutes);
router.use('/podcasts', podcastRoutes);
router.use('/courses', courseRoutes);
router.use('/messages', messageRoutes);
router.use('/games', gameRoutes);

module.exports = router;
