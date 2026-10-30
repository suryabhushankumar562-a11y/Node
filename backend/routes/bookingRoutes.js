const express = require('express');
const {
  createBooking,
  verifyPayment,
  getMyBookings,
  getBookingById,
  rescheduleBooking,
  cancelBooking,
  getAllBookings,
} = require('../controllers/bookingController');
const {
  createBookingValidator,
  verifyPaymentValidator,
  rescheduleValidator,
} = require('../validators/bookingValidator');
const validate = require('../middlewares/validate');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/', createBookingValidator, validate, createBooking);
router.post('/verify-payment', verifyPaymentValidator, validate, verifyPayment);
router.get('/my', getMyBookings);
router.get('/', authorize('admin', 'receptionist'), getAllBookings);
router.get('/:id', getBookingById);
router.patch('/:id/reschedule', rescheduleValidator, validate, rescheduleBooking);
router.patch('/:id/cancel', cancelBooking);

module.exports = router;
