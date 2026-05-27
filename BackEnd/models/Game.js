const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, required: true },
  icon: { type: String, default: 'Gamepad2' },
  color: { type: String, default: 'text-blue-500' },
  rating: { type: Number, default: 0 },
  comments: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      content: String,
      createdAt: { type: Date, default: Date.now }
    }
  ],
  isOfficial: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Game', gameSchema);
