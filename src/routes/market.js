const router = require('express').Router();
const { getMarket, getValuation } = require('../controllers/listingController');
const { protect } = require('../middleware/auth');

router.get('/',            getMarket);
router.post('/valuation',  protect, getValuation);

module.exports = router;
