const router = require('express').Router();
const ctrl   = require('../controllers/listingController');
const { protect, adminOnly, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

// ─── Public ──────────────────────────────────────────────────
router.get('/',         optionalAuth, ctrl.getListings);
router.get('/:id',      optionalAuth, ctrl.getListing);

// ─── Foydalanuvchi ───────────────────────────────────────────
router.post('/:id/favorite', protect, ctrl.toggleFavorite);
router.get('/user/favorites',protect, ctrl.getFavorites);
router.post('/:id/inquiry',  protect, ctrl.addInquiry);

// ─── Admin ───────────────────────────────────────────────────
router.post('/',
  protect, adminOnly,
  upload.array('images', 10),
  ctrl.createListing
);
router.put('/:id',
  protect, adminOnly,
  upload.array('images', 10),
  ctrl.updateListing
);
router.delete('/:id', protect, adminOnly, ctrl.deleteListing);

module.exports = router;
