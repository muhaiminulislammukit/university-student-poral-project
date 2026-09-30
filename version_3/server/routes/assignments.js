const express = require('express');
const router = express.Router();
const Assignment = require('../models/Assignment');
const { protect, authorize } = require('../middleware/auth');

const tryDB = async (fn, fallback) => {
  try { return await fn(); } catch (e) { return fallback; }
};

const MOCK_ASSIGNMENTS = [
  {
    _id: 'ma1',
    title: 'AVL Tree Rotations & Balanced Search Implementation',
    course: 'CSC 114',
    teacher: 'Dr. Ahmed Hossain',
    deadline: new Date('2026-10-08'),
    totalMarks: 20,
    status: 'Active',
    instructions: 'Implement AVL Tree rotation (LL, RR, LR, RL) in C++ or Java with unit test cases.',
    submissions: [
      { studentId: 'CSC114-001', studentName: 'Rahim Ahmed', submittedAt: new Date('2026-09-29'), solutionLink: 'https://github.com/rahim-cse/avl-tree', notes: 'Benchmarked with 100k insertions', status: 'Graded', marks: 19.5, feedback: 'Brilliant performance analysis' },
      { studentId: 'CSC114-002', studentName: 'Nusrat Jahan', submittedAt: new Date('2026-09-30'), solutionLink: 'https://github.com/nusrat-codes/avl', notes: 'Includes deletion rebalancing tests', status: 'Submitted', marks: null, feedback: '' }
    ]
  },
  {
    _id: 'ma2',
    title: 'Hospital Database Normalization to BCNF',
    course: 'CSC 115',
    teacher: 'Prof. Karim Ullah',
    deadline: new Date('2026-10-12'),
    totalMarks: 15,
    status: 'Active',
    instructions: 'Decompose hospital schema to BCNF showing all dependency analysis.',
    submissions: [
      { studentId: 'CSC114-001', studentName: 'Rahim Ahmed', submittedAt: new Date('2026-09-30'), solutionLink: 'https://drive.google.com/file', notes: 'Functional deps proven mathematically', status: 'Submitted', marks: null, feedback: '' }
    ]
  }
];

// GET all assignments
router.get('/', protect, async (req, res) => {
  const { course } = req.query;
  const assignments = await tryDB(
    async () => {
      const filter = course ? { course } : {};
      return await Assignment.find(filter).sort({ createdAt: -1 });
    },
    course ? MOCK_ASSIGNMENTS.filter(a => a.course === course) : MOCK_ASSIGNMENTS
  );
  res.json({ success: true, count: assignments.length, data: assignments });
});

// GET single assignment
router.get('/:id', protect, async (req, res) => {
  const assignment = await tryDB(
    async () => await Assignment.findById(req.params.id),
    MOCK_ASSIGNMENTS.find(a => a._id === req.params.id)
  );
  if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found' });
  res.json({ success: true, data: assignment });
});

// POST create assignment (teacher/admin)
router.post('/', protect, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const assignment = await Assignment.create({
      ...req.body,
      teacher: req.user.name,
      teacherId: req.user._id
    });
    res.status(201).json({ success: true, data: assignment });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// POST submit solution (student)
router.post('/:id/submit', protect, authorize('student'), async (req, res) => {
  const { solutionLink, notes } = req.body;
  const studentId = req.user.studentId;

  if (!solutionLink) {
    return res.status(400).json({ success: false, message: 'Solution link is required' });
  }

  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found' });

    const existingIdx = assignment.submissions.findIndex(s => s.studentId === studentId);
    const newSub = {
      studentId,
      studentName: req.user.name,
      submittedAt: new Date(),
      solutionLink,
      fileName: solutionLink.split('/').pop() || 'solution',
      notes: notes || '',
      status: existingIdx !== -1 ? assignment.submissions[existingIdx].status : 'Submitted',
      marks: existingIdx !== -1 ? assignment.submissions[existingIdx].marks : null,
      feedback: existingIdx !== -1 ? assignment.submissions[existingIdx].feedback : ''
    };

    if (existingIdx !== -1) {
      assignment.submissions[existingIdx] = newSub;
    } else {
      assignment.submissions.push(newSub);
    }

    await assignment.save();
    res.json({ success: true, data: assignment, message: 'Submission saved!' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// POST grade a submission (teacher/admin)
router.post('/:id/grade/:studentId', protect, authorize('teacher', 'admin'), async (req, res) => {
  const { marks, feedback } = req.body;

  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found' });

    const subIdx = assignment.submissions.findIndex(s => s.studentId === req.params.studentId);
    if (subIdx === -1) return res.status(404).json({ success: false, message: 'Submission not found' });

    assignment.submissions[subIdx].marks = parseFloat(marks);
    assignment.submissions[subIdx].feedback = feedback || '';
    assignment.submissions[subIdx].status = 'Graded';

    await assignment.save();
    res.json({ success: true, data: assignment, message: 'Grade saved!' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE assignment (teacher/admin)
router.delete('/:id', protect, authorize('teacher', 'admin'), async (req, res) => {
  try {
    await Assignment.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Assignment deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
module.exports.MOCK_ASSIGNMENTS = MOCK_ASSIGNMENTS;
