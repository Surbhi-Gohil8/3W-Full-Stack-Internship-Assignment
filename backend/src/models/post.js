const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const postSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  username: {
    type: String,
    required: [true, 'Username is required']
  },
  text: {
    type: String,
    trim: true
  },
  imageUrl: {
    type: String // base64 string
  },
  likes: {
    type: [String], // array of usernames
    default: []
  },
  comments: [commentSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add validation to ensure at least one of text or imageUrl is present
postSchema.pre('validate', function(next) {
  if (!this.text && !this.imageUrl) {
    this.invalidate('text', 'A post must have either text or an image.');
    this.invalidate('imageUrl', 'A post must have either text or an image.');
  }
  next();
});

module.exports = mongoose.model('Post', postSchema);
