const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, default: '' },
  section: { type: String, enum: ['A', 'B'], default: 'A' },
  batch: { type: String, default: '56th Batch' },
  bloodGroup: { type: String, default: 'O+' },
  address: { type: String, default: '' },
  guardianName: { type: String, default: '' },
  guardianPhone: { type: String, default: '' },
  attendance: { type: Number, default: 85, min: 0, max: 100 },
  cgpa: { type: Number, default: 3.50, min: 0, max: 4.00 },
  creditsCompleted: { type: Number, default: 45 },
  status: { type: String, enum: ['Active', 'Warning', 'Suspended'], default: 'Active' },
  avatar: {
    type: String,
    default: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Student', studentSchema);
