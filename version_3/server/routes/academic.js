const express = require('express');
const router = express.Router();
const Routine = require('../models/Routine');
const Notice = require('../models/Notice');
const { protect, authorize } = require('../middleware/auth');

const MOCK_ROUTINE = [
  { _id: 'rtn1', day: 'Sunday', time: '09:00 AM - 10:30 AM', course: 'CSC 114', name: 'Data Structures & Algorithms', teacher: 'Dr. Ahmed Hossain', room: 'Room 301', type: 'Lecture', section: 'Section A' },
  { _id: 'rtn2', day: 'Sunday', time: '10:45 AM - 12:15 PM', course: 'MAT 111', name: 'Discrete Mathematics', teacher: 'Dr. Rahman Khan', room: 'Room 204', type: 'Lecture', section: 'Section A & B' },
  { _id: 'rtn3', day: 'Monday', time: '10:00 AM - 01:00 PM', course: 'CSC 114', name: 'Algorithms Lab', teacher: 'Dr. Ahmed Hossain', room: 'Software Lab 3', type: 'Lab', section: 'Section A' },
  { _id: 'rtn4', day: 'Tuesday', time: '09:00 AM - 10:30 AM', course: 'CSC 115', name: 'Database Systems', teacher: 'Prof. Karim Ullah', room: 'Room 302', type: 'Lecture', section: 'Section A & B' },
  { _id: 'rtn5', day: 'Tuesday', time: '11:00 AM - 12:30 PM', course: 'ENG 101', name: 'Technical Communication', teacher: 'Ms. Sadia Jahan', room: 'Room 105', type: 'Lecture', section: 'Section A' },
  { _id: 'rtn6', day: 'Wednesday', time: '09:00 AM - 12:00 PM', course: 'CSC 115', name: 'Database Lab', teacher: 'Prof. Karim Ullah', room: 'Lab 2', type: 'Lab', section: 'Section A' },
  { _id: 'rtn7', day: 'Thursday', time: '10:00 AM - 11:30 AM', course: 'EEE 103', name: 'Electrical Circuits', teacher: 'Engr. Mostafa Kamal', room: 'Hardware Lab 1', type: 'Lecture', section: 'Section A & B' },
  { _id: 'rtn8', day: 'Thursday', time: '11:45 AM - 01:15 PM', course: 'CSC 116', name: 'Advanced Algorithms', teacher: 'Dr. Ahmed Hossain', room: 'Room 304', type: 'Lecture', section: 'Section A' }
];

const MOCK_NOTICES = [
  { _id: 'ntn1', title: 'CSC 114 Midterm Examination Schedule', category: 'Exam', author: 'Dr. Ahmed Hossain', target: 'All Students', isPinned: true, message: 'The Midterm exam for CSC 114 is scheduled for October 18th in Central Hall A. Syllabus covers Arrays to Binary Trees.', createdAt: new Date('2026-09-30') },
  { _id: 'ntn2', title: '75% Attendance Mandatory Notice', category: 'Urgent', author: 'Academic Registrar', target: 'All Students', isPinned: true, message: 'Students below 75% attendance will be barred from Final Examinations per Academic Code Article 14.3.', createdAt: new Date('2026-09-29') },
  { _id: 'ntn3', title: 'Lab 3 Server Upgrades Complete', category: 'Academic', author: 'System Administrator', target: 'CSE Dept', isPinned: false, message: 'Software Lab 3 now has upgraded 32-core workstations with Ubuntu 24.04 LTS and GCC 14 compiler.', createdAt: new Date('2026-09-28') },
  { _id: 'ntn4', title: 'National Coding Hackathon 2026 Registrations Open', category: 'Event', author: 'CSE Club Advisor', target: 'Undergraduate Batches', isPinned: false, message: 'Register your team for the 2026 National Collegiate Coding Championship before October 5th.', createdAt: new Date('2026-09-26') }
];

const tryDB = async (fn, fallback) => {
  try { return await fn(); } catch (e) { return fallback; }
};

// ---- ROUTINE ROUTES ----
router.get('/routine', protect, async (req, res) => {
  const { day } = req.query;
  const data = await tryDB(
    async () => {
      const filter = day ? { day } : {};
      return await Routine.find(filter).sort({ day: 1, time: 1 });
    },
    day ? MOCK_ROUTINE.filter(r => r.day === day) : MOCK_ROUTINE
  );
  res.json({ success: true, count: data.length, data });
});

router.post('/routine', protect, authorize('admin'), async (req, res) => {
  try {
    const slot = await Routine.create(req.body);
    res.status(201).json({ success: true, data: slot });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.delete('/routine/:id', protect, authorize('admin'), async (req, res) => {
  try {
    await Routine.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Routine slot deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---- NOTICE ROUTES ----
router.get('/notices', protect, async (req, res) => {
  const data = await tryDB(
    async () => await Notice.find().sort({ isPinned: -1, createdAt: -1 }),
    MOCK_NOTICES
  );
  res.json({ success: true, count: data.length, data });
});

router.post('/notices', protect, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const notice = await Notice.create({
      ...req.body,
      author: req.user.name,
      authorId: req.user._id
    });
    res.status(201).json({ success: true, data: notice });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.delete('/notices/:id', protect, authorize('admin'), async (req, res) => {
  try {
    await Notice.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Notice deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
module.exports.MOCK_ROUTINE = MOCK_ROUTINE;
module.exports.MOCK_NOTICES = MOCK_NOTICES;
