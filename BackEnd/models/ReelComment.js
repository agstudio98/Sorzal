const mongoose = require('mongoose');

const reelCommentSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  reel: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Reel' },
  content: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('ReelComment', reelCommentSchema);
