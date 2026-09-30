const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  studentName: { type: String, required: true },
  submittedAt: { type: Date, default: Date.now },
  solutionLink: { type: String, default: '' },
  fileName: { type: String, default: '' },
  notes: { type: String, default: '' },
  status: { type: String, enum: ['Submitted', 'Graded', 'Late'], default: 'Submitted' },
  marks: { type: Number, default: null },
  feedback: { type: String, default: '' }
});

const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  course: { type: String, required: true },
  teacher: { type: String, required: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deadline: { type: Date, required: true },
  totalMarks: { type: Number, default: 20 },
  status: { type: String, enum: ['Active', 'Closed', 'Draft'], default: 'Active' },
  instructions: { type: String, default: '' },
  submissions: [submissionSchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Assignment', assignmentSchema);
