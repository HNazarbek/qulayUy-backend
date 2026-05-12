const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      console.error('❌ MONGODB_URI .env faylida topilmadi!');
      process.exit(1);
    }

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      family: 4, // ← BU ASOSIY TUZATISH (IPv4 majburlaydi)
    });

    console.log(`✅ MongoDB ulandi: ${conn.connection.host}`);
  } catch (err) {
    console.error('❌ MongoDB xatolik:', err.message);
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB ulanish uzildi');
});

module.exports = connectDB;