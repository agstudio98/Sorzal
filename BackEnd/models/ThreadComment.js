const mongoose = require('mongoose');

const threadCommentSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  thread: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Thread' },
  parentComment: { type: mongoose.Schema.Types.ObjectId, ref: 'ThreadComment', default: null },
  content: { type: String, required: true },
  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  downvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

module.exports = mongoose.model('ThreadComment', threadCommentSchema);
