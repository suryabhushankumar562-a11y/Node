const express = require('express');
const {
  getDashboardStats,
  getRevenueReport,
  getMostBookedServices,
  getMostActiveCustomers,
  getTherapistPerformance,
  getBookingStatistics,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/reports/revenue', getRevenueReport);
router.get('/reports/most-booked-services', getMostBookedServices);
router.get('/reports/most-active-customers', getMostActiveCustomers);
router.get('/reports/therapist-performance', getTherapistPerformance);
router.get('/reports/booking-stats', getBookingStatistics);

module.exports = router;
