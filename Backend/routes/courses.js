const express = require('express');
const router = express.Router();
const pool = require('../db');

let fallbackCourses = [
  { code: "CSC 114", name: "Data Structures & Algorithms", teacher: "Dr. Ahmed Hossain", credit: 3, department: "CSE", room: "Room 301 / Lab 3", semester: "3rd Semester", description: "Arrays, Linked Lists, Stacks, Queues, Binary Trees, Graphs, Sorting algorithms." },
  { code: "CSC 115", name: "Database Management Systems", teacher: "Prof. Karim Ullah", credit: 3, department: "CSE", room: "Lab 2 (Server Room)", semester: "3rd Semester", description: "Relational Algebra, SQL, Normalization, ACID Transactions, Indexing." },
  { code: "MAT 111", name: "Discrete Mathematics", teacher: "Dr. Rahman Khan", credit: 3, department: "Mathematics", room: "Room 204", semester: "3rd Semester", description: "Propositional Logic, Set Theory, Combinatorics, Graph Theory." },
  { code: "ENG 101", name: "Technical Communication", teacher: "Ms. Sadia Jahan", credit: 2, department: "English", room: "Room 105", semester: "3rd Semester", description: "Technical writing, research report drafting, academic presentations." },
  { code: "EEE 103", name: "Electrical Circuits & Electronics", teacher: "Engr. Mostafa Kamal", credit: 3, department: "EEE", room: "Hardware Lab 1", semester: "3rd Semester", description: "Ohm's Law, Kirchhoff's Laws, Diodes, Transistors, Op-Amps." }
];

// GET /api/courses
router.get('/', async (req, res) => {
  if (pool) {
    try {
      const [rows] = await pool.query('SELECT * FROM courses ORDER BY code ASC');
      return res.json(rows);
    } catch (e) {}
  }
  res.json(fallbackCourses);
});

// POST /api/courses
router.post('/', async (req, res) => {
  const c = req.body;
  if (!c.code || !c.name || !c.teacher) {
    return res.status(400).json({ error: "Code, Name, and Teacher are required" });
  }

  const courseObj = {
    code: c.code.toUpperCase(),
    name: c.name,
    teacher: c.teacher,
    credit: parseInt(c.credit) || 3,
    department: c.department || "CSE",
    room: c.room || "Room 301",
    semester: "3rd Semester",
    description: c.description || ""
  };

  if (pool) {
    try {
      await pool.query(
        'INSERT INTO courses (code, name, teacher, credit, department, room, semester, description) VALUES (?,?,?,?,?,?,?,?)',
        [courseObj.code, courseObj.name, courseObj.teacher, courseObj.credit, courseObj.department, courseObj.room, courseObj.semester, courseObj.description]
      );
    } catch (e) {}
  }

  fallbackCourses = fallbackCourses.filter(x => x.code !== courseObj.code);
  fallbackCourses.push(courseObj);
  res.status(201).json({ success: true, course: courseObj });
});

// DELETE /api/courses/:code
router.delete('/:code', async (req, res) => {
  const { code } = req.params;
  if (pool) {
    try {
      await pool.query('DELETE FROM courses WHERE code = ?', [code]);
    } catch (e) {}
  }
  fallbackCourses = fallbackCourses.filter(c => c.code !== code);
  res.json({ success: true, message: `Course ${code} deleted` });
});

module.exports = router;
