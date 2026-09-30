const express = require('express');
const router = express.Router();
const pool = require('../db');

let fallbackAttendance = [
  {
    id: "ATT-101",
    date: "2026-09-28",
    course: "CSC 114",
    section: "A",
    takenBy: "Dr. Ahmed Hossain",
    records: { "CSC114-001": "present", "CSC114-002": "present", "CSC114-005": "present" }
  },
  {
    id: "ATT-102",
    date: "2026-09-28",
    course: "CSC 114",
    section: "B",
    takenBy: "Dr. Ahmed Hossain",
    records: { "CSC114-003": "present", "CSC114-004": "late", "CSC114-006": "absent" }
  },
  {
    id: "ATT-103",
    date: "2026-09-30",
    course: "CSC 114",
    section: "A",
    takenBy: "Dr. Ahmed Hossain",
    records: { "CSC114-001": "present", "CSC114-002": "present", "CSC114-005": "present" }
  }
];

// GET /api/attendance
router.get('/', async (req, res) => {
  const { course, section, date } = req.query;

  if (pool) {
    try {
      let q = 'SELECT * FROM attendance WHERE 1=1';
      const p = [];
      if (course) { q += ' AND course = ?'; p.push(course); }
      if (section) { q += ' AND section = ?'; p.push(section); }
      if (date) { q += ' AND date = ?'; p.push(date); }
      const [rows] = await pool.query(q, p);
      return res.json(rows.map(r => ({
        ...r,
        records: typeof r.records_json === 'string' ? JSON.parse(r.records_json) : r.records_json
      })));
    } catch (e) {}
  }

  let list = [...fallbackAttendance];
  if (course) list = list.filter(a => a.course === course);
  if (section) list = list.filter(a => a.section === section);
  if (date) list = list.filter(a => a.date === date);
  res.json(list);
});

// POST /api/attendance
router.post('/', async (req, res) => {
  const { date, course, section, takenBy, records } = req.body;
  if (!date || !course || !section || !records) {
    return res.status(400).json({ error: "Missing required attendance parameters" });
  }

  const session = {
    id: "ATT-" + Date.now(),
    date,
    course,
    section,
    takenBy: takenBy || "Course Teacher",
    records
  };

  if (pool) {
    try {
      await pool.query(
        'INSERT INTO attendance (id, date, course, section, takenBy, records_json) VALUES (?,?,?,?,?,?)',
        [session.id, session.date, session.course, session.section, session.takenBy, JSON.stringify(session.records)]
      );
    } catch (e) {}
  }

  // Remove duplicate same-day same-course same-section if any
  fallbackAttendance = fallbackAttendance.filter(a => !(a.date === date && a.course === course && a.section === section));
  fallbackAttendance.push(session);

  res.status(201).json({ success: true, attendance: session });
});

module.exports = router;
