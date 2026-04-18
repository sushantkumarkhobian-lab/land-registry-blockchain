const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Some logs might be system-wide or anonymous
  },
  username: String, // Store username for quick display
  activity: {
    type: String,
    required: true
  },
  details: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

const Log = mongoose.model('Log', logSchema);
module.exports = Log;
