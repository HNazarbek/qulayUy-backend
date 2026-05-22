// backend/src/middleware/auth.js
// Mavjud faylni shu bilan almashtiring (yoki yo'q bo'lsa yarating)

const jwt  = require('jsonwebtoken');
const User = require('../models/User');

// ── Himoya (token tekshirish) ──
exports.protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token)
      return res.status(401).json({ success: false, message: 'Tizimga kiring' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
    const user = await User.findById(decoded.id).select('-password');

    if (!user)
      return res.status(401).json({ success: false, message: 'Foydalanuvchi topilmadi' });

    if (user.isActive === false)
      return res.status(403).json({ success: false, message: 'Hisobingiz bloklangan' });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token yaroqsiz' });
  }
};

// ── Faqat admin ──
exports.adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin')
    return res.status(403).json({ success: false, message: 'Faqat admin uchun' });
  next();
};