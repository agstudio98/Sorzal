const mongoose = require('mongoose');

const threadSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, required: true },
  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  downvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  repliesCount: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Thread', threadSchema);
