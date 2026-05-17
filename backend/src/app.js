const express = require('express');
const cors = require('cors');
require('dotenv').config();

const bookmarkRoutes = require('./routes/bookmarkRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  methods: ['GET', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');
const { requireAuth } = require('./middleware/authMiddleware');

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/bookmarks', requireAuth, bookmarkRoutes);
app.use('/api/chat', requireAuth, chatRoutes);
// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.status(200).json({ success: true, message: 'Bookmark API is running.' });
});

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Route not found.' });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
