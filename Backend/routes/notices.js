const express = require('express');
const router = express.Router();
const pool = require('../db');

let fallbackNotices = [
  { id: "NTC-001", title: "CSC 114 Midterm Examination Schedule & Syllabus", category: "Exam", author: "Dr. Ahmed Hossain", date: "30 Sep 2026", isPinned: true, message: "The Midterm exam for CSC 114 will cover Chapters 1 through 5. Bring ID cards." },
  { id: "NTC-002", title: "Lab 3 High-Performance Server Upgrade Complete", category: "Academic", author: "System Administrator", date: "29 Sep 2026", isPinned: false, message: "Software Lab 3 is now equipped with upgraded 32GB RAM workstations." },
  { id: "NTC-003", title: "Inter-University Hackathon 2026 Batch Nominations", category: "Event", author: "CSE Club Advisor", date: "27 Sep 2026", isPinned: true, message: "Students with CGPA >= 3.50 eligible to represent the batch." },
  { id: "NTC-004", title: "Notice regarding 75% Attendance Requirement", category: "Urgent", author: "Head of Dept", date: "25 Sep 2026", isPinned: false, message: "Students having attendance below 75% will be strictly barred from sitting for final exams." }
];

// GET /api/notices
router.get('/', async (req, res) => {
  if (pool) {
    try {
      const [rows] = await pool.query('SELECT * FROM notices ORDER BY isPinned DESC, id DESC');
      return res.json(rows);
    } catch (e) {}
  }
  res.json(fallbackNotices);
});

// POST /api/notices
router.post('/', async (req, res) => {
  const { title, category, author, message, isPinned } = req.body;
  if (!title || !message) {
    return res.status(400).json({ error: "Title and message required" });
  }

  const notice = {
    id: "NTC-" + Date.now(),
    title,
    category: category || "Academic",
    author: author || "Administration",
    date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    isPinned: Boolean(isPinned),
    message
  };

  if (pool) {
    try {
      await pool.query(
        'INSERT INTO notices (id, title, category, author, date, isPinned, message) VALUES (?,?,?,?,?,?,?)',
        [notice.id, notice.title, notice.category, notice.author, notice.date, notice.isPinned ? 1 : 0, notice.message]
      );
    } catch (e) {}
  }

  fallbackNotices.unshift(notice);
  res.status(201).json({ success: true, notice });
});

// DELETE /api/notices/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  if (pool) {
    try {
      await pool.query('DELETE FROM notices WHERE id = ?', [id]);
    } catch (e) {}
  }
  fallbackNotices = fallbackNotices.filter(n => n.id !== id);
  res.json({ success: true, message: "Notice deleted" });
});

module.exports = router;
