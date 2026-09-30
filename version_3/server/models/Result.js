const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  studentName: { type: String, required: true },
  course: { type: String, required: true },
  mid: { type: Number, default: 0, min: 0, max: 30 },
  final: { type: Number, default: 0, min: 0, max: 50 },
  quiz: { type: Number, default: 0, min: 0, max: 20 },
  total: { type: Number, default: 0 },
  grade: { type: String, default: 'F' },
  gpa: { type: Number, default: 0.00 },
  semester: { type: String, default: 'Fall 2026' },
  remarks: { type: String, default: '' },
  gradedBy: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Auto-calculate grade on save
resultSchema.pre('save', function (next) {
  const total = Math.min(100, Math.round(this.mid + this.final + this.quiz));
  this.total = total;
  this.updatedAt = Date.now();

  if (total >= 80)       { this.grade = 'A+'; this.gpa = 4.00; }
  else if (total >= 75)  { this.grade = 'A';  this.gpa = 3.75; }
  else if (total >= 70)  { this.grade = 'A-'; this.gpa = 3.50; }
  else if (total >= 65)  { this.grade = 'B+'; this.gpa = 3.25; }
  else if (total >= 60)  { this.grade = 'B';  this.gpa = 3.00; }
  else if (total >= 55)  { this.grade = 'B-'; this.gpa = 2.75; }
  else if (total >= 50)  { this.grade = 'C+'; this.gpa = 2.50; }
  else if (total >= 45)  { this.grade = 'C';  this.gpa = 2.25; }
  else if (total >= 40)  { this.grade = 'D';  this.gpa = 2.00; }
  else                   { this.grade = 'F';  this.gpa = 0.00; }

  next();
});

module.exports = mongoose.model('Result', resultSchema);
