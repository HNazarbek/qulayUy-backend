const User         = require('../models/User');
const Notification = require('../models/Notification');
const { signToken } = require('../middleware/auth');

// ─── Yordamchi: token + user yuborish ────────────────────────
const sendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  res.status(statusCode).json({
    success: true,
    token,
    user: user.toSafeObject(),
  });
};

// ─── POST /api/auth/register ─────────────────────────────────
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Barcha maydonlarni to'ldiring" });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Parol kamida 6 ta belgi' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: "Bu email allaqachon ro'yxatdan o'tgan" });
    }

    const user = await User.create({ name, email, password, credits: 50 });

    // Xush kelibsiz notification
    await Notification.create({
      user: user._id,
      type: 'welcome',
      title: "UyNarx'ga xush kelibsiz!",
      message: "50 ta bepul AI kredit sovg'a sifatida berildi.",
    });

    sendToken(user, 201, res);
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/auth/login ────────────────────────────────────
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email va parol kiritilishi shart" });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: "Email yoki parol noto'g'ri" });
    }

    const match = await user.comparePassword(password);
    if (!match) {
      return res.status(401).json({ success: false, message: "Email yoki parol noto'g'ri" });
    }

    sendToken(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/auth/me ────────────────────────────────────────
exports.getMe = async (req, res) => {
  res.json({ success: true, user: req.user.toSafeObject() });
};

// ─── PUT /api/auth/update ────────────────────────────────────
exports.updateProfile = async (req, res, next) => {
  try {
    const { phone, avatar, newPassword, confirmPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (phone !== undefined) user.phone = phone;
    if (avatar !== undefined) user.avatar = avatar;

    // Parol o'zgartirish
    if (newPassword) {
      if (newPassword.length < 6) {
        return res.status(400).json({ success: false, message: 'Yangi parol kamida 6 ta belgi' });
      }
      if (newPassword !== confirmPassword) {
        return res.status(400).json({ success: false, message: 'Parollar mos emas' });
      }
      user.password = newPassword;
    }

    await user.save();
    res.json({ success: true, user: user.toSafeObject() });
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /api/auth/delete ─────────────────────────────────
exports.deleteAccount = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { isActive: false });
    res.json({ success: true, message: "Hisob o'chirildi" });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/auth/users — Admin only ────────────────────────
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
  } catch (err) {
    next(err);
  }
};

// ─── PUT /api/auth/users/:id/block — Admin ───────────────────
exports.blockUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'Foydalanuvchi topilmadi' });
    if (user.role === 'admin') return res.status(403).json({ success: false, message: 'Adminni bloklash mumkin emas' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, message: user.isActive ? 'Blok ochildi' : 'Bloklandi', user: user.toSafeObject() });
  } catch (err) {
    next(err);
  }
};
