const express = require('express');
const router = express.Router();

router.use('/auth', require('./authRoutes'));
router.use('/users', require('./userRoutes'));
router.use('/categories', require('./categoryRoutes'));
router.use('/services', require('./serviceRoutes'));
router.use('/therapists', require('./therapistRoutes'));
router.use('/bookings', require('./bookingRoutes'));
router.use('/coupons', require('./couponRoutes'));
router.use('/reviews', require('./reviewRoutes'));
router.use('/notifications', require('./notificationRoutes'));
router.use('/admin', require('./adminRoutes'));

module.exports = router;
