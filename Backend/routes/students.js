const express = require('express');
const router = express.Router();
const pool = require('../db');

let fallbackStudents = [
  { id: "CSC114-001", name: "Rahim Ahmed", email: "rahim@example.com", phone: "+880 1711-000001", section: "A", batch: "56th Batch", bloodGroup: "A+", address: "Dhanmondi, Dhaka", guardianPhone: "+880 1819-111111", attendance: 92, cgpa: 3.78, status: "Active" },
  { id: "CSC114-002", name: "Nusrat Jahan", email: "nusrat@example.com", phone: "+880 1711-000002", section: "A", batch: "56th Batch", bloodGroup: "O+", address: "Uttara, Dhaka", guardianPhone: "+880 1819-222222", attendance: 88, cgpa: 3.85, status: "Active" },
  { id: "CSC114-003", name: "Sakib Hasan", email: "sakib@example.com", phone: "+880 1711-000003", section: "B", batch: "56th Batch", bloodGroup: "B+", address: "Mirpur-10, Dhaka", guardianPhone: "+880 1819-333333", attendance: 81, cgpa: 3.42, status: "Active" },
  { id: "CSC114-004", name: "Tanvir Islam", email: "tanvir@example.com", phone: "+880 1711-000004", section: "B", batch: "56th Batch", bloodGroup: "AB+", address: "Mohammadpur, Dhaka", guardianPhone: "+880 1819-444444", attendance: 74, cgpa: 3.15, status: "Warning" },
  { id: "CSC114-005", name: "Farzana Akter", email: "farzana@example.com", phone: "+880 1711-000005", section: "A", batch: "56th Batch", bloodGroup: "O-", address: "Bashundhara R/A, Dhaka", guardianPhone: "+880 1819-555555", attendance: 95, cgpa: 3.92, status: "Active" },
  { id: "CSC114-006", name: "Mahmudur Rahman", email: "mahmud@example.com", phone: "+880 1711-000006", section: "B", batch: "56th Batch", bloodGroup: "A-", address: "Badda, Dhaka", guardianPhone: "+880 1819-666666", attendance: 68, cgpa: 2.89, status: "Warning" }
];

// GET /api/students
router.get('/', async (req, res) => {
  const { search, section } = req.query;

  if (pool) {
    try {
      let query = 'SELECT * FROM students WHERE 1=1';
      const params = [];
      if (section && section !== 'ALL') {
        query += ' AND section = ?';
        params.push(section);
      }
      if (search) {
        query += ' AND (name LIKE ? OR id LIKE ? OR email LIKE ?)';
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }
      query += ' ORDER BY id ASC';
      const [rows] = await pool.query(query, params);
      return res.json(rows);
    } catch (e) {
      console.warn("[Student API] DB error:", e.message);
    }
  }

  // Fallback memory
  let results = [...fallbackStudents];
  if (section && section !== 'ALL') {
    results = results.filter(s => s.section === section);
  }
  if (search) {
    const q = search.toLowerCase();
    results = results.filter(s => s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q) || s.email.toLowerCase().includes(q));
  }
  res.json(results);
});

// GET /api/students/:id
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  if (pool) {
    try {
      const [rows] = await pool.query('SELECT * FROM students WHERE id = ?', [id]);
      if (rows.length) return res.json(rows[0]);
    } catch (e) {}
  }
  const s = fallbackStudents.find(x => x.id === id);
  if (!s) return res.status(404).json({ error: "Student not found" });
  res.json(s);
});

// POST /api/students
router.post('/', async (req, res) => {
  const s = req.body;
  if (!s.id || !s.name || !s.email) {
    return res.status(400).json({ error: "ID, Name, and Email are required" });
  }

  const studentObj = {
    id: s.id,
    name: s.name,
    email: s.email,
    phone: s.phone || "",
    section: s.section || "A",
    batch: s.batch || "56th Batch",
    bloodGroup: s.bloodGroup || "A+",
    address: s.address || "",
    guardianPhone: s.guardianPhone || "",
    attendance: parseFloat(s.attendance) || 85.00,
    cgpa: parseFloat(s.cgpa) || 3.50,
    status: s.status || "Active"
  };

  if (pool) {
    try {
      await pool.query(
        'INSERT INTO students (id, name, email, phone, section, batch, bloodGroup, address, guardianPhone, attendance, cgpa, status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
        [studentObj.id, studentObj.name, studentObj.email, studentObj.phone, studentObj.section, studentObj.batch, studentObj.bloodGroup, studentObj.address, studentObj.guardianPhone, studentObj.attendance, studentObj.cgpa, studentObj.status]
      );
    } catch (e) {
      console.warn("[Student API] DB insert error:", e.message);
    }
  }

  fallbackStudents = fallbackStudents.filter(x => x.id !== studentObj.id);
  fallbackStudents.push(studentObj);
  res.status(201).json({ success: true, student: studentObj });
});

// PUT /api/students/:id
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  if (pool) {
    try {
      await pool.query(
        'UPDATE students SET name = ?, email = ?, phone = ?, section = ?, batch = ?, bloodGroup = ?, address = ?, guardianPhone = ?, status = ? WHERE id = ?',
        [updates.name, updates.email, updates.phone, updates.section, updates.batch, updates.bloodGroup, updates.address, updates.guardianPhone, updates.status, id]
      );
    } catch (e) {}
  }

  const idx = fallbackStudents.findIndex(s => s.id === id);
  if (idx >= 0) {
    fallbackStudents[idx] = { ...fallbackStudents[idx], ...updates, id };
    return res.json({ success: true, student: fallbackStudents[idx] });
  }

  res.status(404).json({ error: "Student not found" });
});

// DELETE /api/students/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  if (pool) {
    try {
      await pool.query('DELETE FROM students WHERE id = ?', [id]);
    } catch (e) {}
  }
  fallbackStudents = fallbackStudents.filter(s => s.id !== id);
  res.json({ success: true, message: `Student ${id} deleted` });
});

module.exports = router;
