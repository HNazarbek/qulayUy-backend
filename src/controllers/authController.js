// backend/src/controllers/authController.js
// Mavjud controller faylingizga quyidagi funksiyalarni qo'shing
// (yoki butun faylni shu bilan almashtiring)

const User    = require('../models/User');
const jwt     = require('jsonwebtoken');
const bcrypt  = require('bcryptjs');

// ── Token yaratish ──
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', { expiresIn: '30d' });

// ── Register ──
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: "Barcha maydonlarni to'ldiring" });

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists)
      return res.status(400).json({ success: false, message: 'Bu email allaqachon ro\'yxatdan o\'tgan' });

    const user = await User.create({ name, email: email.toLowerCase(), password });
    const token = signToken(user._id);
    localStorage_token: token;

    res.status(201).json({
      success: true,
      token,
      user: user.toSafeObject ? user.toSafeObject() : { ...user.toObject(), password: undefined },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Login ──
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email va parol kiriting' });

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user)
      return res.status(401).json({ success: false, message: "Email yoki parol noto'g'ri" });

    if (user.isActive === false)
      return res.status(403).json({ success: false, message: 'Hisobingiz bloklangan. Admin bilan bog\'laning.' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(401).json({ success: false, message: "Email yoki parol noto'g'ri" });

    const token = signToken(user._id);

    res.json({
      success: true,
      token,
      user: user.toSafeObject ? user.toSafeObject() : { ...user.toObject(), password: undefined },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Get Me ──
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user)
      return res.status(404).json({ success: false, message: 'Foydalanuvchi topilmadi' });

    res.json({
      success: true,
      user: user.toSafeObject ? user.toSafeObject() : { ...user.toObject(), password: undefined },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Update Profile ──
exports.updateProfile = async (req, res) => {
  try {
    const { phone, avatar, password } = req.body;
    const updates = {};
    if (phone !== undefined) updates.phone = phone;
    if (avatar !== undefined) updates.avatar = avatar;

    if (password) {
      if (password.length < 6)
        return res.status(400).json({ success: false, message: 'Parol kamida 6 belgi' });
      updates.password = password; // model pre-save hook hash qiladi
    }

    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true });
    res.json({
      success: true,
      user: user.toSafeObject ? user.toSafeObject() : { ...user.toObject(), password: undefined },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Get All Users (admin) ──
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      total: users.length,
      users,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Block User (admin) ──
exports.blockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user)
      return res.status(404).json({ success: false, message: 'Foydalanuvchi topilmadi' });

    if (user.role === 'admin')
      return res.status(403).json({ success: false, message: 'Admin bloklana olmaydi' });

    user.isActive = false;
    await user.save();

    res.json({
      success: true,
      message: 'Foydalanuvchi bloklandi',
      user: { ...user.toObject(), password: undefined },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Unblock User (admin) ──
exports.unblockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user)
      return res.status(404).json({ success: false, message: 'Foydalanuvchi topilmadi' });

    user.isActive = true;
    await user.save();

    res.json({
      success: true,
      message: 'Foydalanuvchi blokdan chiqarildi',
      user: { ...user.toObject(), password: undefined },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Delete User (admin) ──
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user)
      return res.status(404).json({ success: false, message: 'Foydalanuvchi topilmadi' });

    if (user.role === 'admin')
      return res.status(403).json({ success: false, message: 'Admin o\'chirilmaydi' });

    await User.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "Foydalanuvchi o'chirildi" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};