const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  title: String,
  price: Number,
  pricePerM2: Number,
  size: Number,
  rooms: Number,
  floor: Number,
  totalFloors: Number,
  district: String,
  city: String,
  status: String,
  badge: String,
  estimatedValue: Number,
  images: [String],
  description: String,
  amenities: [String],
  address: String,
  lat: Number,
  lng: Number,
  agent: {
    name: String,
    title: String,
    rating: Number,
    reviews: Number,
  },
  views: { type: Number, default: 0 },
  favorites: { type: Number, default: 0 },
  inquiries: { type: Number, default: 0 },
  isPublished: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // ← qo'shing
}, { timestamps: true });

module.exports = mongoose.model('Listing', listingSchema);