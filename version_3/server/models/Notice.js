const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: {
    type: String,
    enum: ['Academic', 'Exam', 'Urgent', 'Event'],
    default: 'Academic'
  },
  author: { type: String, required: true },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  target: { type: String, default: 'All Students' },
  isPinned: { type: Boolean, default: false },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notice', noticeSchema);
