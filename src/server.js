require('dotenv').config();
const express  = require('express');
const path     = require('path');

const connectDB     = require('./config/db');
const errorHandler  = require('./middleware/errorHandler');

const authRoutes    = require('./routes/auth');
const listingRoutes = require('./routes/listings');
const marketRoutes  = require('./routes/market');
const notifRoutes   = require('./routes/notifications');

// ─── App ─────────────────────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 4000;

// ─── MongoDB ─────────────────────────────────────────────────
connectDB();

// ─── Middleware ──────────────────────────────────────────────
const cors = require('cors');
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174',
  ],
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Statik fayllar (yuklangan rasmlar) ─────────────────────
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ─── Routes ──────────────────────────────────────────────────
app.use('/api/auth',           authRoutes);
app.use('/api/listings',       listingRoutes);
app.use('/api/market',         marketRoutes);
app.use('/api/notifications',  notifRoutes);

// ─── Health check ────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    app: 'qulayUy / UyNarx Backend',
    version: '1.0.0',
    time: new Date().toISOString(),
  });
});

// ─── 404 ─────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route topilmadi: ${req.originalUrl}` });
});

// ─── Global error handler ────────────────────────────────────
app.use(errorHandler);

// ─── Start ───────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Server ishga tushdi: http://localhost:${PORT}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API: http://localhost:${PORT}/api\n`);
});

module.exports = app;
