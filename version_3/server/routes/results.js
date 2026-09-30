const express = require('express');
const router = express.Router();
const Result = require('../models/Result');
const { protect, authorize } = require('../middleware/auth');

const MOCK_RESULTS = [
  { _id: 'mr1', studentId: 'CSC114-001', studentName: 'Rahim Ahmed', course: 'CSC 114', mid: 28, final: 48, quiz: 18, total: 94, grade: 'A+', gpa: 4.00, semester: 'Fall 2026', remarks: 'Exemplary performance' },
  { _id: 'mr2', studentId: 'CSC114-001', studentName: 'Rahim Ahmed', course: 'CSC 115', mid: 26, final: 45, quiz: 17, total: 88, grade: 'A', gpa: 3.75, semester: 'Fall 2026', remarks: 'Excellent database skills' },
  { _id: 'mr3', studentId: 'CSC114-002', studentName: 'Nusrat Jahan', course: 'CSC 114', mid: 29, final: 49, quiz: 19, total: 97, grade: 'A+', gpa: 4.00, semester: 'Fall 2026', remarks: 'Outstanding project design' },
  { _id: 'mr4', studentId: 'CSC114-002', studentName: 'Nusrat Jahan', course: 'CSC 115', mid: 28, final: 47, quiz: 18, total: 93, grade: 'A+', gpa: 4.00, semester: 'Fall 2026', remarks: 'Top score in normalization' },
  { _id: 'mr5', studentId: 'CSC114-003', studentName: 'Sakib Hasan', course: 'CSC 114', mid: 23, final: 41, quiz: 15, total: 79, grade: 'B+', gpa: 3.25, semester: 'Fall 2026', remarks: 'Good lab performance' },
  { _id: 'mr6', studentId: 'CSC114-004', studentName: 'Tanvir Islam', course: 'CSC 114', mid: 18, final: 36, quiz: 14, total: 68, grade: 'B-', gpa: 2.75, semester: 'Fall 2026', remarks: 'Needs improvement in recursion' }
];

const tryDB = async (fn, fallback) => {
  try { return await fn(); } catch (e) { return fallback; }
};

// GET results for a specific student
router.get('/student/:studentId', protect, async (req, res) => {
  const { studentId } = req.params;

  if (req.user.role === 'student' && req.user.studentId !== studentId) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }

  const results = await tryDB(
    async () => await Result.find({ studentId }).sort({ course: 1 }),
    MOCK_RESULTS.filter(r => r.studentId === studentId)
  );

  // Calculate CGPA
  let totalCredits = 0;
  let totalPoints = 0;
  const creditMap = { 'CSC 114': 3, 'CSC 115': 3, 'MAT 111': 3, 'ENG 101': 2, 'EEE 103': 3, 'CSC 116': 3 };
  
  results.forEach(r => {
    const credit = creditMap[r.course] || 3;
    totalCredits += credit;
    totalPoints += r.gpa * credit;
  });

  const cgpa = totalCredits > 0 ? parseFloat((totalPoints / totalCredits).toFixed(2)) : 0;

  res.json({ success: true, data: results, cgpa, totalCredits });
});

// GET all results (teacher/admin)
router.get('/', protect, authorize('teacher', 'admin'), async (req, res) => {
  const { course, section } = req.query;
  const results = await tryDB(
    async () => {
      const filter = {};
      if (course) filter.course = course;
      return await Result.find(filter).sort({ studentId: 1 });
    },
    MOCK_RESULTS.filter(r => !course || r.course === course)
  );
  res.json({ success: true, count: results.length, data: results });
});

// POST / PUT bulk save grades (teacher/admin)
router.post('/bulk', protect, authorize('teacher', 'admin'), async (req, res) => {
  const { grades } = req.body; // Array of { studentId, studentName, course, mid, final, quiz }

  if (!grades || !Array.isArray(grades)) {
    return res.status(400).json({ success: false, message: 'grades array is required' });
  }

  try {
    const savedResults = [];
    for (const g of grades) {
      const result = await Result.findOneAndUpdate(
        { studentId: g.studentId, course: g.course },
        {
          ...g,
          gradedBy: req.user.name || 'Faculty',
          updatedAt: Date.now()
        },
        { upsert: true, new: true, runValidators: true }
      );
      savedResults.push(result);
    }
    res.json({ success: true, data: savedResults, message: `${savedResults.length} results saved` });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;
module.exports.MOCK_RESULTS = MOCK_RESULTS;
