const express = require('express');
const {
  getTherapists,
  getTherapistById,
  createTherapistProfile,
  updateTherapistProfile,
  applyLeave,
  decideLeave,
  getAssignedBookings,
} = require('../controllers/therapistController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', getTherapists);
router.get('/:id', getTherapistById);
router.post('/', protect, authorize('admin'), createTherapistProfile);
router.put('/:id', protect, authorize('admin', 'therapist'), updateTherapistProfile);
router.post('/:id/leaves', protect, authorize('therapist'), applyLeave);
router.patch('/:id/leaves/:leaveId', protect, authorize('admin'), decideLeave);
router.get('/:id/bookings', protect, authorize('admin', 'therapist'), getAssignedBookings);

module.exports = router;
