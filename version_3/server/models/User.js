const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    lowercase: true,
    maxlength: [60, 'Username cannot exceed 60 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [4, 'Password must be at least 4 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['student', 'teacher', 'admin'],
    required: true,
    default: 'student'
  },
  // Student-specific
  studentId: {
    type: String,
    sparse: true,
    trim: true
  },
  section: {
    type: String,
    enum: ['A', 'B'],
    default: 'A'
  },
  batch: { type: String, default: '56th Batch' },
  // Teacher/Admin-specific
  title: { type: String, default: '' },
  department: { type: String, default: 'Computer Science & Engineering' },
  room: { type: String, default: '' },
  phone: { type: String, default: '' },
  assignedCourses: [{ type: String }],
  // Profile data
  avatar: {
    type: String,
    default: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
  },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Match password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
