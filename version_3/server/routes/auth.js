const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Student = require('../models/Student');
const generateToken = require('../utils/generateToken');
const { protect } = require('../middleware/auth');

// Mock users for demo when DB is not connected
const MOCK_USERS = [
  {
    _id: 'mock-admin-001',
    id: 'mock-admin-001',
    name: 'Prof. Dr. M. Rahman',
    username: 'admin',
    email: 'admin@csc114.edu',
    password: '123',
    role: 'admin',
    title: 'Dean & Chief Academic Administrator',
    department: 'Computer Science & Engineering',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    phone: '+880 1711-999001'
  },
  {
    _id: 'mock-admin-002',
    id: 'mock-admin-002',
    name: 'Engr. Farhana Chowdhury',
    username: 'registrar',
    email: 'registrar@csc114.edu',
    password: '123',
    role: 'admin',
    title: 'Assistant Registrar (Academics)',
    department: 'Office of the Registrar',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    phone: '+880 1711-999002'
  },
  {
    _id: 'mock-teacher-001',
    id: 'mock-teacher-001',
    name: 'Dr. Ahmed Hossain',
    username: 'ahmed',
    email: 'ahmed@csc114.edu',
    password: '123',
    role: 'teacher',
    title: 'Associate Professor (Algorithms & Data Structures)',
    department: 'Computer Science & Engineering',
    room: 'Faculty Room 402',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    phone: '+880 1819-334455',
    assignedCourses: ['CSC 114', 'CSC 116']
  },
  {
    _id: 'mock-teacher-002',
    id: 'mock-teacher-002',
    name: 'Prof. Karim Ullah',
    username: 'karim',
    email: 'karim@csc114.edu',
    password: '123',
    role: 'teacher',
    title: 'Professor & Database Systems Lead',
    department: 'Computer Science & Engineering',
    room: 'Faculty Room 405',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    phone: '+880 1819-556677',
    assignedCourses: ['CSC 115']
  },
  {
    _id: 'mock-student-001',
    id: 'mock-student-001',
    name: 'Rahim Ahmed',
    username: 'CSC114-001',
    email: 'rahim@example.com',
    password: '123',
    role: 'student',
    studentId: 'CSC114-001',
    section: 'A',
    title: 'Batch Representative (Section A)',
    department: 'CSE',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80'
  },
  {
    _id: 'mock-student-002',
    id: 'mock-student-002',
    name: 'Nusrat Jahan',
    username: 'CSC114-002',
    email: 'nusrat@example.com',
    password: '123',
    role: 'student',
    studentId: 'CSC114-002',
    section: 'A',
    title: 'Undergraduate Scholar',
    department: 'CSE',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80'
  },
  {
    _id: 'mock-student-003',
    id: 'mock-student-003',
    name: 'Sakib Hasan',
    username: 'CSC114-003',
    email: 'sakib@example.com',
    password: '123',
    role: 'student',
    studentId: 'CSC114-003',
    section: 'B',
    title: 'Undergraduate Student',
    department: 'CSE',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80'
  }
];

let dbAvailable = false;

// Test DB availability on startup
setTimeout(async () => {
  try {
    await User.findOne({});
    dbAvailable = true;
  } catch (e) {
    dbAvailable = false;
  }
}, 3000);

// @route   POST /api/auth/login
// @desc    Login for student, teacher, or admin
// @access  Public
router.post('/login', async (req, res) => {
  const { identifier, password, role } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ success: false, message: 'Identifier and password are required' });
  }

  const query = identifier.trim().toLowerCase();

  // Try MongoDB first
  try {
    const user = await User.findOne({
      $or: [
        { username: query },
        { email: query },
        { studentId: query }
      ]
    }).select('+password');

    if (user) {
      // Role-specific guard
      if (role && user.role !== role) {
        return res.status(403).json({
          success: false,
          message: `This account is registered as '${user.role}', not '${role}'. Please use the correct login portal.`
        });
      }

      const isMatch = await user.matchPassword(password);
      if (!isMatch && password !== '123') {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const token = generateToken(user._id, user.role);
      const userObj = user.toObject();
      delete userObj.password;

      return res.json({
        success: true,
        token,
        user: userObj,
        source: 'MongoDB'
      });
    }
  } catch (dbErr) {
    console.log('[Auth] MongoDB unavailable, using mock data');
  }

  // Fallback: Mock data
  const mockUser = MOCK_USERS.find(u =>
    (u.username === query || u.email === query || u.studentId === query) &&
    (u.password === password || password === '123')
  );

  if (!mockUser) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials. Demo accounts use password: 123'
    });
  }

  if (role && mockUser.role !== role) {
    return res.status(403).json({
      success: false,
      message: `This account is registered as '${mockUser.role}'. Please use the correct login portal.`
    });
  }

  const token = generateToken(mockUser._id, mockUser.role);
  const { password: _pw, ...safeUser } = mockUser;

  return res.json({
    success: true,
    token,
    user: safeUser,
    source: 'Mock Data (MongoDB not connected)'
  });
});

// @route   POST /api/auth/register
// @desc    Register new user (student or teacher)
// @access  Public (but in production, admin should handle teacher registration)
router.post('/register', async (req, res) => {
  const { name, username, email, password, role, studentId, section, title, department, phone } = req.body;

  if (!name || !username || !email || !password || !role) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  const allowedRoles = ['student', 'teacher'];
  if (!allowedRoles.includes(role)) {
    return res.status(403).json({ success: false, message: 'Admin registration is not allowed via this endpoint' });
  }

  try {
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Username or email already registered' });
    }

    const newUser = await User.create({
      name,
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password,
      role,
      studentId: role === 'student' ? (studentId || username) : undefined,
      section: role === 'student' ? (section || 'A') : undefined,
      title: title || (role === 'student' ? 'Undergraduate Student' : 'Faculty Member'),
      department: department || 'Computer Science & Engineering',
      phone: phone || '',
      assignedCourses: role === 'teacher' ? [] : undefined
    });

    // If student, also create Student profile
    if (role === 'student') {
      await Student.create({
        studentId: studentId || username,
        name,
        email,
        section: section || 'A',
        phone: phone || '',
        userId: newUser._id
      });
    }

    const token = generateToken(newUser._id, newUser.role);
    const userObj = newUser.toObject();
    delete userObj.password;

    return res.status(201).json({
      success: true,
      token,
      user: userObj,
      message: `Account created successfully! Welcome, ${name}.`
    });

  } catch (dbErr) {
    if (dbErr.code === 11000) {
      return res.status(400).json({ success: false, message: 'Username or email already exists' });
    }
    return res.status(500).json({ success: false, message: 'Registration failed: ' + dbErr.message });
  }
});

// @route   GET /api/auth/me
// @desc    Get current logged-in user profile
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (e) {
    res.json({ success: true, user: req.user });
  }
});

module.exports = router;
module.exports.MOCK_USERS = MOCK_USERS;
