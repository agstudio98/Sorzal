const Product = require('../models/Product');
const Comment = require('../models/Comment');

// @desc    Get comments for a product
const getProductComments = async (req, res) => {
  try {
    const comments = await Comment.find({ product: req.params.id })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching comments' });
  }
};

// @desc    Add comment to product
const addProductComment = async (req, res) => {
  const { userId, content, rating } = req.body;
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const comment = await Comment.create({
      user: userId,
      product: req.params.id,
      content,
      rating: Number(rating) || 5,
    });

    // Recalculate average rating
    const comments = await Comment.find({ product: req.params.id });
    product.numReviews = comments.length;
    product.rating = comments.reduce((acc, item) => item.rating + acc, 0) / comments.length;
    await product.save();

    const populated = await comment.populate('user', 'name avatar');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Error adding comment' });
  }
};

// @desc    Update a comment
const updateComment = async (req, res) => {
  const { userId, content, rating } = req.body;
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    if (comment.user.toString() !== userId) return res.status(401).json({ message: 'Unauthorized' });

    comment.content = content;
    if (rating) comment.rating = Number(rating);
    await comment.save();

    // Recalculate average rating of the product
    const product = await Product.findById(comment.product);
    if (product) {
        const comments = await Comment.find({ product: product._id });
        product.rating = comments.reduce((acc, item) => item.rating + acc, 0) / comments.length;
        await product.save();
    }

    const populated = await comment.populate('user', 'name avatar');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Error updating comment' });
  }
};

// @desc    Delete a comment
const deleteComment = async (req, res) => {
  const { userId } = req.body;
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    if (comment.user.toString() !== userId) return res.status(401).json({ message: 'Unauthorized' });

    const productId = comment.product;
    await comment.deleteOne();

    // Recalculate average rating of the product
    const product = await Product.findById(productId);
    if (product) {
        const comments = await Comment.find({ product: productId });
        product.numReviews = comments.length;
        if (comments.length > 0) {
            product.rating = comments.reduce((acc, item) => item.rating + acc, 0) / comments.length;
        } else {
            product.rating = 0;
        }
        await product.save();
    }

    res.json({ message: 'Comment removed' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting comment' });
  }
};

// @desc    Toggle Like on product
const toggleLikeProduct = async (req, res) => {
  const { userId } = req.body;
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const alreadyLiked = product.likes.includes(userId);
    if (alreadyLiked) {
      product.likes = product.likes.filter(id => id.toString() !== userId);
    } else {
      product.likes.push(userId);
    }
    await product.save();
    res.json({ likes: product.likes });
  } catch (error) {
    res.status(500).json({ message: 'Error toggling like' });
  }
};

// @desc    Create a product
const createProduct = async (req, res) => {
  const { name, description, category, price, imageUrl, userId } = req.body;
  try {
    const product = new Product({
      user: userId,
      name,
      description,
      category,
      price: Number(price) || 0,
      imageUrl,
    });
    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ 
      message: 'Error creating product', 
      error: error.message,
      details: error.errors // Mongoose validation errors
    });
  }
};

const getProducts = async (req, res) => {
  try {
    const pageSize = 12;
    const page = Number(req.query.pageNumber) || 1;
    const category = req.query.category;
    const keyword = req.query.keyword;
    const isMarket = req.query.isMarket === 'true';

    let query = {};
    if (keyword) {
      query.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } }
      ];
    }
    if (category && category !== 'Todos') {
      query.category = category;
    }
    if (isMarket) {
      query.price = { $gt: 0 };
    }

    const count = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('user', 'name avatar')
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort({ createdAt: -1 });

    res.json({ products, page, pages: Math.ceil(count / pageSize) });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const getTopProducts = async (req, res) => {
  try {
    const products = await Product.find({})
      .populate('user', 'name avatar')
      .sort({ 'likes.length': -1 })
      .limit(5);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('user', 'name avatar');
    if (product) res.json(product);
    else res.status(404).json({ message: 'Product not found' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getProducts,
  getTopProducts,
  getProductById,
  getProductComments,
  addProductComment,
  updateComment,
  deleteComment,
  toggleLikeProduct,
  createProduct,
};
