const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true, maxlength: 30 },
  description: { type: String, required: true, maxlength: 200 },
  videoPath: { type: String, required: true },
  thumbnailPath: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

module.exports = mongoose.model('Video', videoSchema);
