const router = require('express').Router();
const ctrl   = require('../controllers/authController');
const { protect, adminOnly } = require('../middleware/auth');

// ─── Public ──────────────────────────────────────────────────
router.post('/register', ctrl.register);
router.post('/login',    ctrl.login);

// ─── Protected ───────────────────────────────────────────────
router.get('/me',       protect, ctrl.getMe);
router.put('/update',   protect, ctrl.updateProfile);
router.delete('/delete',protect, ctrl.deleteAccount);

// ─── Admin ───────────────────────────────────────────────────
router.get('/users',              protect, adminOnly, ctrl.getAllUsers);
router.put('/users/:id/block',    protect, adminOnly, ctrl.blockUser);

module.exports = router;
