const express = require('express');
const router = express.Router();
const pool = require('../db');

function calculateGrade(mid, final, quiz) {
  const m = parseFloat(mid) || 0;
  const f = parseFloat(final) || 0;
  const q = parseFloat(quiz) || 0;
  const total = Math.min(100, Math.round(m + f + q));
  let grade = "F"; let gpa = 0.00;
  if (total >= 80) { grade = "A+"; gpa = 4.00; }
  else if (total >= 75) { grade = "A";  gpa = 3.75; }
  else if (total >= 70) { grade = "A-"; gpa = 3.50; }
  else if (total >= 65) { grade = "B+"; gpa = 3.25; }
  else if (total >= 60) { grade = "B";  gpa = 3.00; }
  else if (total >= 55) { grade = "B-"; gpa = 2.75; }
  else if (total >= 50) { grade = "C+"; gpa = 2.50; }
  else if (total >= 45) { grade = "C";  gpa = 2.25; }
  else if (total >= 40) { grade = "D";  gpa = 2.00; }
  return { total, grade, gpa };
}

let fallbackResults = [
  { id: "RES-001", studentId: "CSC114-001", studentName: "Rahim Ahmed", course: "CSC 114", mid: 28, final: 48, quiz: 18, total: 94, grade: "A+", gpa: 4.00, semester: "Fall 2026" },
  { id: "RES-002", studentId: "CSC114-001", studentName: "Rahim Ahmed", course: "CSC 115", mid: 26, final: 44, quiz: 17, total: 87, grade: "A", gpa: 3.75, semester: "Fall 2026" },
  { id: "RES-003", studentId: "CSC114-001", studentName: "Rahim Ahmed", course: "MAT 111", mid: 24, final: 43, quiz: 16, total: 83, grade: "A-", gpa: 3.50, semester: "Fall 2026" },
  { id: "RES-004", studentId: "CSC114-002", studentName: "Nusrat Jahan", course: "CSC 114", mid: 29, final: 49, quiz: 19, total: 97, grade: "A+", gpa: 4.00, semester: "Fall 2026" },
  { id: "RES-005", studentId: "CSC114-002", studentName: "Nusrat Jahan", course: "CSC 115", mid: 27, final: 46, quiz: 18, total: 91, grade: "A+", gpa: 4.00, semester: "Fall 2026" }
];

// GET /api/results
router.get('/', async (req, res) => {
  const { studentId, course } = req.query;

  if (pool) {
    try {
      let q = 'SELECT * FROM results WHERE 1=1';
      const p = [];
      if (studentId) { q += ' AND studentId = ?'; p.push(studentId); }
      if (course && course !== 'ALL') { q += ' AND course = ?'; p.push(course); }
      const [rows] = await pool.query(q, p);
      return res.json(rows);
    } catch (e) {}
  }

  let list = [...fallbackResults];
  if (studentId) list = list.filter(r => r.studentId === studentId);
  if (course && course !== 'ALL') list = list.filter(r => r.course === course);
  res.json(list);
});

// POST /api/results
router.post('/', async (req, res) => {
  const { studentId, studentName, course, mid, final, quiz } = req.body;
  if (!studentId || !course) {
    return res.status(400).json({ error: "Student ID and Course are required" });
  }

  const { total, grade, gpa } = calculateGrade(mid, final, quiz);

  const resultObj = {
    id: "RES-" + Date.now(),
    studentId,
    studentName: studentName || "Student",
    course,
    mid: parseFloat(mid) || 0,
    final: parseFloat(final) || 0,
    quiz: parseFloat(quiz) || 0,
    total,
    grade,
    gpa,
    semester: "Fall 2026"
  };

  if (pool) {
    try {
      await pool.query(
        'INSERT INTO results (id, studentId, course, mid, final, quiz, total, grade, gpa, semester) VALUES (?,?,?,?,?,?,?,?,?,?)',
        [resultObj.id, resultObj.studentId, resultObj.course, resultObj.mid, resultObj.final, resultObj.quiz, resultObj.total, resultObj.grade, resultObj.gpa, resultObj.semester]
      );
    } catch (e) {}
  }

  fallbackResults = fallbackResults.filter(r => !(r.studentId === studentId && r.course === course));
  fallbackResults.push(resultObj);

  res.status(201).json({ success: true, result: resultObj });
});

// DELETE /api/results/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  if (pool) {
    try {
      await pool.query('DELETE FROM results WHERE id = ?', [id]);
    } catch (e) {}
  }
  fallbackResults = fallbackResults.filter(r => r.id !== id);
  res.json({ success: true, message: "Result deleted" });
});

module.exports = router;
