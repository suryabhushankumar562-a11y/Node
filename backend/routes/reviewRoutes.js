const express = require('express');
const { createReview, getServiceReviews, moderateReview } = require('../controllers/reviewController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/service/:serviceId', getServiceReviews);
router.post('/', protect, createReview);
router.patch('/:id/moderate', protect, authorize('admin'), moderateReview);

module.exports = router;
