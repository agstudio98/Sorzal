const mongoose = require('mongoose');

const scoreSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    gameId: {
      type: String,
      required: true,
    },
    points: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Asegurar que un usuario solo tenga un record por juego (se actualiza si es mayor)
scoreSchema.index({ user: 1, gameId: 1 }, { unique: true });

const Score = mongoose.model('Score', scoreSchema);

module.exports = Score;
