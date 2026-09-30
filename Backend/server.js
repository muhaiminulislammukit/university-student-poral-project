const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../')));

// Mount Modular API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/students', require('./routes/students'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/results', require('./routes/results'));
app.use('/api/notices', require('./routes/notices'));
app.use('/api/assignments', require('./routes/assignments'));
app.use('/api/routine', require('./routes/routine'));

// System Health Check & Summary
app.get('/api/health', (req, res) => {
  res.json({
    status: "online",
    service: "CSC 114 Academic Backend REST API",
    version: "2.0.0",
    timestamp: new Date().toISOString(),
    routes: [
      "/api/auth",
      "/api/students",
      "/api/courses",
      "/api/attendance",
      "/api/results",
      "/api/notices",
      "/api/assignments",
      "/api/routine"
    ]
  });
});

// Fallback route for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../Index.html'));
});

app.listen(PORT, () => {
  console.log(`================================================================`);
  console.log(`🎓 CSC 114 Academic Portal REST API Server Online!`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🌐 Static Web Frontend: http://localhost:${PORT}/`);
  console.log(`================================================================`);
});
