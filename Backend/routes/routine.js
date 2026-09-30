const express = require('express');
const router = express.Router();
const pool = require('../db');

let fallbackRoutine = [
  { id: "RTN-001", day: "Sunday", time: "09:00 AM - 10:30 AM", course: "CSC 114", name: "Data Structures & Algorithms", teacher: "Dr. Ahmed Hossain", room: "Room 301", type: "Lecture" },
  { id: "RTN-002", day: "Sunday", time: "10:45 AM - 12:15 PM", course: "MAT 111", name: "Discrete Mathematics", teacher: "Dr. Rahman Khan", room: "Room 204", type: "Lecture" },
  { id: "RTN-003", day: "Monday", time: "10:00 AM - 01:00 PM", course: "CSC 114", name: "Data Structures Lab", teacher: "Dr. Ahmed Hossain", room: "Software Lab 3", type: "Lab" },
  { id: "RTN-004", day: "Tuesday", time: "09:00 AM - 10:30 AM", course: "CSC 115", name: "Database Systems", teacher: "Prof. Karim Ullah", room: "Room 302", type: "Lecture" },
  { id: "RTN-005", day: "Tuesday", time: "11:00 AM - 12:30 PM", course: "ENG 101", name: "Technical Communication", teacher: "Ms. Sadia Jahan", room: "Room 105", type: "Lecture" },
  { id: "RTN-006", day: "Wednesday", time: "09:00 AM - 12:00 PM", course: "CSC 115", name: "Database Systems Lab", teacher: "Prof. Karim Ullah", room: "Lab 2 (Server Room)", type: "Lab" },
  { id: "RTN-007", day: "Thursday", time: "10:00 AM - 11:30 AM", course: "EEE 103", name: "Electrical Circuits", teacher: "Engr. Mostafa Kamal", room: "Hardware Lab 1", type: "Lecture" }
];

// GET /api/routine
router.get('/', (req, res) => {
  const { day } = req.query;
  let list = [...fallbackRoutine];
  if (day && day !== "ALL") list = list.filter(r => r.day.toLowerCase() === day.toLowerCase());
  res.json(list);
});

// POST /api/routine
router.post('/', (req, res) => {
  const { day, time, course, name, teacher, room, type } = req.body;
  const newRtn = {
    id: "RTN-" + Date.now(),
    day,
    time,
    course,
    name: name || course,
    teacher: teacher || "Faculty",
    room: room || "Room 301",
    type: type || "Lecture"
  };
  fallbackRoutine.push(newRtn);
  res.status(201).json({ success: true, routine: newRtn });
});

// DELETE /api/routine/:id
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  fallbackRoutine = fallbackRoutine.filter(r => r.id !== id);
  res.json({ success: true, message: "Routine slot deleted" });
});

module.exports = router;
