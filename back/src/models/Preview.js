const mongoose = require('mongoose');

const PreviewSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

const Preview = mongoose.model('Preview', PreviewSchema);
module.exports = Preview;