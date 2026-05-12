const router = require('express').Router();
const ctrl   = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

router.get('/',                    protect, ctrl.getNotifications);
router.put('/read-all',            protect, ctrl.markAllRead);
router.put('/:id/read',            protect, ctrl.markOneRead);

module.exports = router;
