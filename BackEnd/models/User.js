const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  lastName: { type: String, default: '' },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String, default: '' },
  bio: { type: String, default: '' },
  role: { type: String, default: 'user' },
  
  // 2FA / Security
  is2FAEnabled: { type: Boolean, default: false },
  twoFASecret: { type: String },
  otpEnabled: { type: Boolean, default: false },

  // Payment methods
  paymentMethods: [
    {
      cardType: String,
      lastFour: String,
      cvv: String,
      expiry: String,
    }
  ],

  // Preferences
  interests: [{ type: String }],
  affinities: [{ type: String }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  // Tinder-like features
  age: { type: Number },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  sign: { type: String },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: [] }],
  dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: [] }],
  matches: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: [] }],
  
  // AI Simulation
  isAI: { type: Boolean, default: false },
  aiPersona: { type: String, default: '' },
  
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
