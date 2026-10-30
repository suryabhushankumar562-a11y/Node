const express = require('express');
const {
  getServices,
  getServiceBySlug,
  createService,
  updateService,
  deleteService,
} = require('../controllers/serviceController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

const router = express.Router();

router.get('/', getServices);
router.get('/:slug', getServiceBySlug);
router.post('/', protect, authorize('admin'), upload.array('images', 6), createService);
router.put('/:id', protect, authorize('admin'), upload.array('images', 6), updateService);
router.delete('/:id', protect, authorize('admin'), deleteService);

module.exports = router;
