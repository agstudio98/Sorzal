const express = require('express');
const router = express.Router();
const { addOrderItems, getOrderById } = require('../controllers/orderController');

router.post('/', addOrderItems);
router.get('/:id', getOrderById);

module.exports = router;
