const mongoose = require('mongoose');

const routineSchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
    required: true
  },
  time: { type: String, required: true },
  course: { type: String, required: true },
  name: { type: String, required: true },
  teacher: { type: String, required: true },
  room: { type: String, required: true },
  type: { type: String, enum: ['Lecture', 'Lab'], default: 'Lecture' },
  section: { type: String, default: 'Section A' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Routine', routineSchema);
