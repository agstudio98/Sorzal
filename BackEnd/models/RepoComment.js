const mongoose = require('mongoose');

const repoCommentSchema = new mongoose.Schema({
  repo: { type: mongoose.Schema.Types.ObjectId, ref: 'Repo', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('RepoComment', repoCommentSchema);
