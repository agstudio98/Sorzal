const express = require('express');
const router = express.Router();
const {
  getProducts,
  getTopProducts,
  getProductById,
  getProductComments,
  addProductComment,
  updateComment,
  deleteComment,
  toggleLikeProduct,
  createProduct,
} = require('../controllers/productController');

router.get('/', getProducts);
router.post('/', createProduct);
router.get('/top', getTopProducts);
router.get('/:id', getProductById);
router.get('/:id/comments', getProductComments);
router.post('/:id/comments', addProductComment);
router.put('/:id/comments/:commentId', updateComment);
router.delete('/:id/comments/:commentId', deleteComment);
router.post('/:id/like', toggleLikeProduct);

module.exports = router;
