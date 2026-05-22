// backend/src/routes/auth.js
// Mavjud faylingizga quyidagi routelarni qo'shing
// (router.post('/login'...) va router.post('/register'...) dan KEYIN)

const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const authController = require('../controllers/authController');

// Mavjud routelar
router.post('/register', authController.register);
router.post('/login',    authController.login);
router.get('/me',        protect, authController.getMe);

// ── Admin: barcha userlar ──
router.get('/users', protect, adminOnly, authController.getAllUsers);

// ── Admin: userni bloklash ──
router.patch('/users/:id/block',   protect, adminOnly, authController.blockUser);
router.patch('/users/:id/unblock', protect, adminOnly, authController.unblockUser);

// ── Admin: userni o'chirish ──
router.delete('/users/:id', protect, adminOnly, authController.deleteUser);

// ── Profil yangilash ──
router.put('/profile', protect, authController.updateProfile);

module.exports = router;