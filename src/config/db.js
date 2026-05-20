// config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI); // MONGO_URI emas!
    console.log(`✅ MongoDB ulandi: ${conn.connection.host}`);
  } catch (err) {
    console.error('❌ MongoDB ulanmadi:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;