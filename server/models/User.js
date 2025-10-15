const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['user','admin'], default: 'user' },
  // add more fields as needed
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
