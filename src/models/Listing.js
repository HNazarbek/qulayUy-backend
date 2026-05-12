const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema({
  name:    { type: String, required: true },
  title:   { type: String, default: 'Agent' },
  rating:  { type: Number, default: 5.0, min: 1, max: 5 },
  reviews: { type: Number, default: 0 },
}, { _id: false });

const listingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Sarlavha kiritilishi shart"],
    trim: true,
    minlength: 5,
    maxlength: 120,
  },
  district: {
    type: String,
    required: [true, "Tuman kiritilishi shart"],
    trim: true,
  },
  city: {
    type: String,
    required: [true, "Shahar kiritilishi shart"],
    trim: true,
    default: 'Tashkent',
  },
  address: {
    type: String,
    required: [true, "Manzil kiritilishi shart"],
    trim: true,
  },

  // ─── Narx ───────────────────────────────────────────────────
  price: {
    type: Number,
    required: [true, "Narx kiritilishi shart"],
    min: [1000, "Narx $1,000 dan kam bo'lmasin"],
  },
  estimatedValue: {
    type: Number,
    default: null,
  },
  pricePerM2: {
    type: Number,
    default: null,
  },

  // ─── Parametrlar ────────────────────────────────────────────
  rooms: {
    type: mongoose.Schema.Types.Mixed,  // 1,2,3 yoki 'Studio','5+'
    required: true,
  },
  size: {
    type: Number,
    required: [true, "Maydon kiritilishi shart"],
    min: 10,
  },
  livingArea: { type: Number, default: null },
  floor: {
    type: Number,
    required: [true, "Qavat kiritilishi shart"],
    min: 1,
  },
  totalFloors: {
    type: Number,
    required: [true, "Jami qavatlar kiritilishi shart"],
    min: 1,
  },

  // ─── Holat (AI baholash) ────────────────────────────────────
  status: {
    type: String,
    enum: ['underpriced', 'fair', 'overpriced'],
    default: 'fair',
  },
  badge: {
    type: String,
    default: 'Fair Value',
  },

  // ─── Media ──────────────────────────────────────────────────
  images: {
    type: [String],
    default: [],
  },

  // ─── E'lon turi ─────────────────────────────────────────────
  listingType: {
    type: String,
    enum: ['sale', 'rent'],
    default: 'sale',
  },
  monthlyRent:  { type: Number, default: null },
  deposit:      { type: Number, default: null },
  negotiable:   { type: Boolean, default: false },
  propertyType: {
    type: String,
    enum: ['Kvartira', 'Villa', 'Studiya', 'Penthouse', 'Apartment', 'Studio', 'Other'],
    default: 'Kvartira',
  },

  // ─── Qulayliklar ────────────────────────────────────────────
  amenities: {
    type: [String],
    default: [],
  },
  description: {
    type: String,
    default: '',
    maxlength: 2000,
  },

  // ─── Agent ──────────────────────────────────────────────────
  agent: {
    type: agentSchema,
    default: () => ({ name: 'UyNarx Agent', title: 'Agent', rating: 5.0, reviews: 0 }),
  },

  // ─── Statistika ─────────────────────────────────────────────
  views:     { type: Number, default: 0 },
  favorites: { type: Number, default: 0 },
  inquiries: { type: Number, default: 0 },

  // ─── Egasi ──────────────────────────────────────────────────
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },

  isPublished: { type: Boolean, default: true },
  isDeleted:   { type: Boolean, default: false },

  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [69.2401, 41.2995] }, // [lng, lat]
  },
}, { timestamps: true });

// ─── Indexes ─────────────────────────────────────────────────
listingSchema.index({ location: '2dsphere' });
listingSchema.index({ city: 1, district: 1 });
listingSchema.index({ price: 1 });
listingSchema.index({ status: 1 });
listingSchema.index({ isPublished: 1, isDeleted: 1 });

// ─── Auto pricePerM2 ─────────────────────────────────────────
listingSchema.pre('save', function (next) {
  if (this.price && this.size) {
    this.pricePerM2 = Math.round(this.price / this.size);
  }
  if (!this.estimatedValue) {
    // Oddiy baholash: narx * 1.05 ± 8%
    const factor = 0.97 + Math.random() * 0.16;
    this.estimatedValue = Math.round(this.price * factor);
  }
  // Badge
  if (this.estimatedValue && this.price) {
    const diff = ((this.estimatedValue - this.price) / this.price) * 100;
    if (diff > 5) { this.status = 'underpriced'; this.badge = `-${diff.toFixed(1)}% Underpriced`; }
    else if (diff < -5) { this.status = 'overpriced'; this.badge = `+${Math.abs(diff).toFixed(1)}% Overpriced`; }
    else { this.status = 'fair'; this.badge = 'Fair Value'; }
  }
  next();
});

module.exports = mongoose.model('Listing', listingSchema);
