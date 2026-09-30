const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  course: { type: String, required: true },
  section: { type: String, required: true },
  date: { type: Date, required: true },
  takenBy: { type: String, required: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  records: [{
    studentId: { type: String, required: true },
    studentName: { type: String },
    status: {
      type: String,
      enum: ['present', 'late', 'absent'],
      default: 'present'
    }
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Attendance', attendanceSchema);
