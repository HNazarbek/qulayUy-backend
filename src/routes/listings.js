// backend/src/routes/listings.js
// Mavjud faylni shu bilan almashtiring

const express = require('express');
const router  = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const listingController = require('../controllers/listingController');
const upload = require('../middleware/upload');

router.get('/',     listingController.getListings);
router.get('/:id',  listingController.getListing);

// Admin only
router.post('/',    protect, adminOnly, upload.array('images', 10), listingController.createListing);
router.put('/:id',  protect, adminOnly, listingController.updateListing);
router.delete('/:id', protect, adminOnly, listingController.deleteListing);

module.exports = router;

// ═══════════════════════════════════════════════════════════════
// backend/src/controllers/listingController.js
// Mavjud faylga deleteListing va updateListing qo'shing
// ═══════════════════════════════════════════════════════════════

// ── Update Listing (admin) ──
exports.updateListing = async (req, res) => {
  try {
    const Listing = require('../models/Listing');
    const listing = await Listing.findById(req.params.id);
    if (!listing)
      return res.status(404).json({ success: false, message: 'E\'lon topilmadi' });

    const allowed = ['title','price','district','city','address','rooms','size',
                     'floor','totalFloors','description','status','badge',
                     'amenities','listingType','negotiable','monthlyRent','deposit'];

    allowed.forEach(field => {
      if (req.body[field] !== undefined) listing[field] = req.body[field];
    });

    await listing.save(); // pre-save hook pricePerM2 va badge yangilaydi

    res.json({ success: true, listing });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Delete Listing (admin) ──
exports.deleteListing = async (req, res) => {
  try {
    const Listing = require('../models/Listing');
    const listing = await Listing.findById(req.params.id);
    if (!listing)
      return res.status(404).json({ success: false, message: 'E\'lon topilmadi' });

    // Soft delete
    listing.isDeleted = true;
    listing.isPublished = false;
    await listing.save();

    res.json({ success: true, message: "E'lon o'chirildi" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};