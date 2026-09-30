const express = require('express');
require('dotenv').config();
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB Atlas
connectDB();

// Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// ============================================================
// API Routes
// ============================================================
app.use('/api/auth',        require('./routes/auth'));
app.use('/api/students',    require('./routes/students'));
app.use('/api/courses',     require('./routes/courses'));
app.use('/api/attendance',  require('./routes/attendance'));
app.use('/api/results',     require('./routes/results'));
app.use('/api/assignments', require('./routes/assignments'));
app.use('/api',             require('./routes/academic')); // /api/routine + /api/notices

// ============================================================
// Health Check & API Info
// ============================================================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'CSC 114 University Portal V3 - MERN API',
    version: '3.0.0',
    timestamp: new Date().toISOString(),
    routes: [
      'POST /api/auth/login',
      'POST /api/auth/register',
      'GET  /api/auth/me',
      'GET  /api/students',
      'POST /api/students',
      'GET  /api/courses',
      'GET  /api/attendance',
      'POST /api/attendance',
      'GET  /api/results/student/:studentId',
      'POST /api/results/bulk',
      'GET  /api/assignments',
      'POST /api/assignments',
      'POST /api/assignments/:id/submit',
      'POST /api/assignments/:id/grade/:studentId',
      'GET  /api/routine',
      'GET  /api/notices'
    ]
  });
});

// Global 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.url} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

app.listen(PORT, () => {
  console.log('═══════════════════════════════════════════════════════');
  console.log(`🎓 CSC 114 University Portal - Version 3.0 MERN API`);
  console.log(`📡 Server running at: http://localhost:${PORT}`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`📊 Frontend:     http://localhost:5173`);
  console.log('═══════════════════════════════════════════════════════');
});
