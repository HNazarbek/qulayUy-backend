const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Ism kiritilishi shart"],
    trim: true,
    minlength: 2,
    maxlength: 60,
  },
  email: {
    type: String,
    required: [true, "Email kiritilishi shart"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, "Noto'g'ri email format"],
  },
  password: {
    type: String,
    required: [true, "Parol kiritilishi shart"],
    minlength: 6,
    select: false,       // default select qilmaymiz
  },
  phone: {
    type: String,
    default: '',
    trim: true,
  },
  avatar: {
    type: String,
    default: null,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  credits: {
    type: Number,
    default: 50,
  },
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  joinDate: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

// ─── Parolni hash ───────────────────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ─── Parol tekshirish ────────────────────────────────────────
userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// ─── Xavfsiz JSON (parolsiz) ─────────────────────────────────
userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
