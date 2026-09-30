const express = require('express');
const router = express.Router();
const pool = require('../db');

let fallbackAssignments = [
  {
    id: "ASN-001",
    title: "Binary Search Tree & AVL Balancing Implementation",
    course: "CSC 114",
    deadline: "2026-10-06",
    totalMarks: 20,
    status: "Active",
    description: "Implement AVL Tree rotation in C++ or Java with unit test benchmarks.",
    submissions: [
      {
        studentId: "CSC114-001",
        studentName: "Rahim Ahmed",
        submittedAt: "2026-09-29 18:42",
        fileLink: "avl_tree_solution.zip",
        comments: "Implemented all 4 rotations.",
        status: "Graded",
        marks: 19.5,
        feedback: "Great work!"
      }
    ]
  },
  {
    id: "ASN-002",
    title: "Normalization to 3NF & BCNF Case Study",
    course: "CSC 115",
    deadline: "2026-10-10",
    totalMarks: 15,
    status: "Active",
    description: "Analyze hospital management relational schema and perform BCNF decomposition.",
    submissions: []
  }
];

// GET /api/assignments
router.get('/', (req, res) => {
  res.json(fallbackAssignments);
});

// POST /api/assignments
router.post('/', (req, res) => {
  const { title, course, deadline, totalMarks, description } = req.body;
  const newAsn = {
    id: "ASN-" + Date.now(),
    title,
    course,
    deadline,
    totalMarks: parseInt(totalMarks) || 20,
    status: "Active",
    description,
    submissions: []
  };
  fallbackAssignments.unshift(newAsn);
  res.status(201).json({ success: true, assignment: newAsn });
});

// POST /api/assignments/:id/submit
router.post('/:id/submit', (req, res) => {
  const { id } = req.params;
  const { studentId, studentName, fileLink, comments } = req.body;

  const a = fallbackAssignments.find(x => x.id === id);
  if (!a) return res.status(404).json({ error: "Assignment not found" });

  if (!a.submissions) a.submissions = [];
  a.submissions = a.submissions.filter(s => s.studentId !== studentId);

  const sub = {
    studentId,
    studentName: studentName || "Student",
    submittedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    fileLink: fileLink || "submission.zip",
    comments: comments || "",
    status: "Submitted",
    marks: null,
    feedback: null
  };

  a.submissions.push(sub);
  res.json({ success: true, submission: sub });
});

// PUT /api/assignments/:id/grade
router.put('/:id/grade', (req, res) => {
  const { id } = req.params;
  const { studentId, marks, feedback } = req.body;

  const a = fallbackAssignments.find(x => x.id === id);
  if (!a) return res.status(404).json({ error: "Assignment not found" });

  const sub = (a.submissions || []).find(s => s.studentId === studentId);
  if (sub) {
    sub.marks = parseFloat(marks) || 0;
    sub.feedback = feedback || "";
    sub.status = "Graded";
    return res.json({ success: true, submission: sub });
  }

  res.status(404).json({ error: "Submission not found" });
});

module.exports = router;
