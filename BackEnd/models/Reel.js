const mongoose = require('mongoose');

const reelSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  videoUrl: { type: String, required: true },
  caption: { type: String, required: true },
  song: { type: String, default: 'Original Sound - Sorzal' },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  sharesCount: { type: Number, default: 0 },
  trimStart: { type: Number, default: 0 },
  trimEnd: { type: Number },
  textOverlays: [{
    text: String,
    x: Number,
    y: Number,
    color: String,
    fontSize: Number
  }],
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Reel', reelSchema);
