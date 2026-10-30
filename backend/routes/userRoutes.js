const express = require('express');
const {
  updateProfile,
  addAddress,
  deleteAddress,
  toggleWishlist,
  getUsers,
  toggleUserStatus,
  updateUserRole,
} = require('../controllers/userController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

const router = express.Router();
router.use(protect);

router.put('/profile', upload.single('avatar'), updateProfile);
router.post('/addresses', addAddress);
router.delete('/addresses/:addressId', deleteAddress);
router.post('/wishlist/:serviceId', toggleWishlist);

router.get('/', authorize('admin'), getUsers);
router.patch('/:id/status', authorize('admin'), toggleUserStatus);
router.patch('/:id/role', authorize('admin'), updateUserRole);

module.exports = router;
