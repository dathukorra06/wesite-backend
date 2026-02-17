const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const { errorHandler } = require('./middleware/errorHandler');

// Load env variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

/* =========================
   SECURITY MIDDLEWARE
========================= */
app.use(helmet());

const limiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000,
  max: process.env.RATE_LIMIT_MAX || 100,
  message: {
    success: false,
    message: 'Too many requests. Please try again later.'
  }
});
app.use(limiter);

/* =========================
   CORS
========================= */
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true
}));

/* =========================
   BODY PARSER
========================= */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

/* =========================
   ROOT ROUTE (Fix for Vercel)
========================= */
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Backend is running 🚀',
    api: {
      auth: '/api/auth',
      tasks: '/api/tasks',
      health: '/api/health'
    }
  });
});

/* =========================
   API ROUTES
========================= */
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tasks', require('./routes/tasks'));

/* =========================
   HEALTH CHECK
========================= */
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    time: new Date().toISOString()
  });
});

/* =========================
   404 HANDLER
========================= */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

/* =========================
   ERROR HANDLER
========================= */
app.use(errorHandler);

/* =========================
   SERVER START
========================= */
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

/* =========================
   CRASH PROTECTION
========================= */
process.on('unhandledRejection', err => {
  console.error('Unhandled rejection:', err.message);
  server.close(() => process.exit(1));
});

module.exports = app;
