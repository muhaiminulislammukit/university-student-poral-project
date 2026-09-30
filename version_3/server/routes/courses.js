const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const { protect, authorize } = require('../middleware/auth');

const MOCK_COURSES = [
  { _id: 'mc1', code: 'CSC 114', name: 'Data Structures & Algorithms', teacher: 'Dr. Ahmed Hossain', credit: 3, department: 'CSE', room: 'Room 301 / Lab 3', semester: '3rd Semester', category: 'Core Computer Science', description: 'Arrays, Linked Lists, Stacks, Queues, Binary Trees, Graph Traversal, Sorting and Searching complexity.' },
  { _id: 'mc2', code: 'CSC 115', name: 'Database Management Systems', teacher: 'Prof. Karim Ullah', credit: 3, department: 'CSE', room: 'Lab 2 (Server Center)', semester: '3rd Semester', category: 'Core Computer Science', description: 'Relational algebra, SQL programming, normalization (1NF to BCNF), indexing, and transaction management.' },
  { _id: 'mc3', code: 'MAT 111', name: 'Discrete Mathematics', teacher: 'Dr. Rahman Khan', credit: 3, department: 'Mathematics', room: 'Room 204', semester: '3rd Semester', category: 'Allied Science', description: 'Propositional logic, set theory, combinatorics, graph theory, and recurrence relations.' },
  { _id: 'mc4', code: 'ENG 101', name: 'Technical Communication & Writing', teacher: 'Ms. Sadia Jahan', credit: 2, department: 'English', room: 'Room 105', semester: '3rd Semester', category: 'General Education', description: 'Engineering documentation, technical report writing, and professional communication skills.' },
  { _id: 'mc5', code: 'EEE 103', name: 'Electrical Circuits & Electronics', teacher: 'Engr. Mostafa Kamal', credit: 3, department: 'EEE', room: 'Hardware Lab 1', semester: '3rd Semester', category: 'Engineering Science', description: "Ohm's Law, Kirchhoff's laws, semiconductor devices, BJT amplifiers, and operational amplifiers." },
  { _id: 'mc6', code: 'CSC 116', name: 'Advanced Algorithm Engineering', teacher: 'Dr. Ahmed Hossain', credit: 3, department: 'CSE', room: 'Room 304', semester: '3rd Semester', category: 'Core Elective', description: 'Dynamic programming, network flows, string matching, computational geometry, and NP-completeness.' }
];

const tryDB = async (fn, fallback) => {
  try { return await fn(); } catch (e) { return fallback; }
};

// GET all courses
router.get('/', protect, async (req, res) => {
  const courses = await tryDB(
    async () => await Course.find({ isActive: true }).sort({ code: 1 }),
    MOCK_COURSES
  );
  res.json({ success: true, count: courses.length, data: courses });
});

// GET single course
router.get('/:code', protect, async (req, res) => {
  const course = await tryDB(
    async () => await Course.findOne({ code: req.params.code.toUpperCase() }),
    MOCK_COURSES.find(c => c.code === req.params.code.toUpperCase())
  );
  if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
  res.json({ success: true, data: course });
});

// POST create course (admin only)
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const course = await Course.create(req.body);
    res.status(201).json({ success: true, data: course });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ success: false, message: 'Course code already exists' });
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT update course (admin only)
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    res.json({ success: true, data: course });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE course (admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    res.json({ success: true, message: 'Course deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
module.exports.MOCK_COURSES = MOCK_COURSES;
