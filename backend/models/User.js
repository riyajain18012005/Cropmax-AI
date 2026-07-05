const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'User name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'User email is required'],
    unique: true,
    trim: true,
    lowercase: true
  },
  role: {
    type: String,
    enum: ['Farmer', 'Processor', 'Admin'],
    default: 'Farmer'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', UserSchema);
