const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// Mock students for demo
const MOCK_STUDENTS = [
  { _id: 'ms1', studentId: 'CSC114-001', name: 'Rahim Ahmed', email: 'rahim@example.com', phone: '+880 1711-000001', section: 'A', batch: '56th Batch', bloodGroup: 'A+', address: 'Dhanmondi, Dhaka', guardianName: 'M. A. Ahmed', guardianPhone: '+880 1819-111111', attendance: 94, cgpa: 3.82, creditsCompleted: 45, status: 'Active', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80' },
  { _id: 'ms2', studentId: 'CSC114-002', name: 'Nusrat Jahan', email: 'nusrat@example.com', phone: '+880 1711-000002', section: 'A', batch: '56th Batch', bloodGroup: 'O+', address: 'Uttara, Dhaka', guardianName: 'Md. J. Hossain', guardianPhone: '+880 1819-222222', attendance: 91, cgpa: 3.90, creditsCompleted: 45, status: 'Active', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80' },
  { _id: 'ms3', studentId: 'CSC114-003', name: 'Sakib Hasan', email: 'sakib@example.com', phone: '+880 1711-000003', section: 'B', batch: '56th Batch', bloodGroup: 'B+', address: 'Mirpur-10, Dhaka', guardianName: 'Hasan Ali', guardianPhone: '+880 1819-333333', attendance: 83, cgpa: 3.45, creditsCompleted: 42, status: 'Active', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80' },
  { _id: 'ms4', studentId: 'CSC114-004', name: 'Tanvir Islam', email: 'tanvir@example.com', phone: '+880 1711-000004', section: 'B', batch: '56th Batch', bloodGroup: 'AB+', address: 'Mohammadpur, Dhaka', guardianName: 'Nurul Islam', guardianPhone: '+880 1819-444444', attendance: 72, cgpa: 3.12, creditsCompleted: 39, status: 'Warning', avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&q=80' },
  { _id: 'ms5', studentId: 'CSC114-005', name: 'Farzana Akter', email: 'farzana@example.com', phone: '+880 1711-000005', section: 'A', batch: '56th Batch', bloodGroup: 'O-', address: 'Bashundhara R/A, Dhaka', guardianName: 'Kamal Uddin', guardianPhone: '+880 1819-555555', attendance: 96, cgpa: 3.95, creditsCompleted: 45, status: 'Active', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80' },
  { _id: 'ms6', studentId: 'CSC114-006', name: 'Mahmudur Rahman', email: 'mahmud@example.com', phone: '+880 1711-000006', section: 'B', batch: '56th Batch', bloodGroup: 'A-', address: 'Badda, Dhaka', guardianName: 'M. Rahman', guardianPhone: '+880 1819-666666', attendance: 68, cgpa: 2.88, creditsCompleted: 36, status: 'Warning', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80' }
];

const tryDB = async (fn, fallback) => {
  try {
    return await fn();
  } catch (e) {
    return fallback;
  }
};

// GET all students (admin, teacher)
router.get('/', protect, authorize('admin', 'teacher'), async (req, res) => {
  const { section, status, search } = req.query;
  
  const students = await tryDB(async () => {
    const filter = {};
    if (section) filter.section = section;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    return await Student.find(filter).sort({ studentId: 1 });
  }, MOCK_STUDENTS.filter(s => {
    if (section && s.section !== section) return false;
    if (status && s.status !== status) return false;
    if (search) {
      const q = search.toLowerCase();
      return s.name.toLowerCase().includes(q) || s.studentId.toLowerCase().includes(q) || s.email.toLowerCase().includes(q);
    }
    return true;
  }));

  res.json({ success: true, count: students.length, data: students });
});

// GET single student by studentId
router.get('/:studentId', protect, async (req, res) => {
  const student = await tryDB(
    async () => await Student.findOne({ studentId: req.params.studentId }),
    MOCK_STUDENTS.find(s => s.studentId === req.params.studentId)
  );

  if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

  // Students can only access their own data
  if (req.user.role === 'student' && req.user.studentId !== req.params.studentId) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }

  res.json({ success: true, data: student });
});

// POST create student (admin only)
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const student = await Student.create(req.body);
    res.status(201).json({ success: true, data: student });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ success: false, message: 'Student ID already exists' });
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT update student
router.put('/:studentId', protect, authorize('admin', 'student'), async (req, res) => {
  try {
    const student = await Student.findOneAndUpdate(
      { studentId: req.params.studentId },
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    res.json({ success: true, data: student });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE student (admin only)
router.delete('/:studentId', protect, authorize('admin'), async (req, res) => {
  try {
    const student = await Student.findOneAndDelete({ studentId: req.params.studentId });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    // Also delete their user account
    await User.findOneAndDelete({ studentId: req.params.studentId });
    res.json({ success: true, message: 'Student deregistered successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
module.exports.MOCK_STUDENTS = MOCK_STUDENTS;
