const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, trim: true, uppercase: true },
  name: { type: String, required: true },
  teacher: { type: String, required: true },
  credit: { type: Number, default: 3, min: 1, max: 6 },
  department: { type: String, default: 'CSE' },
  room: { type: String, default: '' },
  semester: { type: String, default: '3rd Semester' },
  category: { type: String, default: 'Core Computer Science' },
  description: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Course', courseSchema);
