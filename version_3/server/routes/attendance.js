const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const { protect, authorize } = require('../middleware/auth');

const tryDB = async (fn, fallback) => {
  try { return await fn(); } catch (e) { return fallback; }
};

// GET all attendance (teacher/admin can see all, student sees their own)
router.get('/', protect, async (req, res) => {
  const { course, section, date } = req.query;
  
  const records = await tryDB(async () => {
    const filter = {};
    if (course) filter.course = course;
    if (section) filter.section = section;
    if (date) filter.date = { $gte: new Date(date), $lt: new Date(new Date(date).getTime() + 86400000) };
    return await Attendance.find(filter).sort({ date: -1 }).limit(100);
  }, []);

  res.json({ success: true, data: records });
});

// GET student's own attendance summary
router.get('/student/:studentId', protect, async (req, res) => {
  const { studentId } = req.params;

  // Students can only see their own data
  if (req.user.role === 'student' && req.user.studentId !== studentId) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }

  const records = await tryDB(
    async () => await Attendance.find({ 'records.studentId': studentId }).sort({ date: -1 }),
    []
  );

  // Compute per-course attendance statistics
  const courseStats = {};
  records.forEach(session => {
    const record = session.records.find(r => r.studentId === studentId);
    if (!record) return;

    if (!courseStats[session.course]) {
      courseStats[session.course] = { course: session.course, present: 0, late: 0, absent: 0, total: 0 };
    }
    courseStats[session.course].total++;
    courseStats[session.course][record.status]++;
  });

  const summary = Object.values(courseStats).map(c => ({
    ...c,
    percentage: c.total > 0 ? Math.round(((c.present + c.late * 0.5) / c.total) * 100) : 0
  }));

  res.json({ success: true, data: summary, rawSessions: records });
});

// POST save attendance session (teacher/admin only)
router.post('/', protect, authorize('teacher', 'admin'), async (req, res) => {
  const { course, section, date, records } = req.body;

  if (!course || !section || !date || !records) {
    return res.status(400).json({ success: false, message: 'Course, section, date and records are required' });
  }

  try {
    // Upsert: find existing session for this date/course/section or create new
    const sessionDate = new Date(date);
    const nextDay = new Date(sessionDate.getTime() + 86400000);

    const existing = await Attendance.findOne({
      course,
      section,
      date: { $gte: sessionDate, $lt: nextDay }
    });

    let session;
    if (existing) {
      existing.records = records;
      existing.takenBy = req.user.name;
      session = await existing.save();
    } else {
      session = await Attendance.create({
        course,
        section,
        date: sessionDate,
        takenBy: req.user.name || 'Faculty',
        teacherId: req.user._id,
        records
      });
    }

    // Recalculate each affected student's attendance percentage
    for (const rec of records) {
      try {
        const allSessions = await Attendance.find({ 'records.studentId': rec.studentId });
        let total = 0, presentScore = 0;
        allSessions.forEach(s => {
          const r = s.records.find(x => x.studentId === rec.studentId);
          if (r) {
            total++;
            if (r.status === 'present') presentScore += 1;
            else if (r.status === 'late') presentScore += 0.5;
          }
        });
        const percentage = total > 0 ? Math.round((presentScore / total) * 100) : 0;
        await Student.findOneAndUpdate(
          { studentId: rec.studentId },
          { attendance: percentage, status: percentage >= 75 ? 'Active' : 'Warning' }
        );
      } catch (e) { /* Skip if student not in DB */ }
    }

    res.json({ success: true, data: session, message: 'Attendance session saved successfully' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;
