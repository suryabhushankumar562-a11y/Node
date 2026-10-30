const asyncHandler = require('express-async-handler');
const Service = require('../models/Service');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { uploadToCloudinary, deleteFromCloudinary } = require('../services/cloudinaryService');

const slugify = (str) =>
  str.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-') + '-' + Date.now().toString(36);

// @route GET /api/v1/services
// Supports: ?search=&category=&minPrice=&maxPrice=&sort=&page=&limit=&featured=
const getServices = asyncHandler(async (req, res) => {
  const { search, category, minPrice, maxPrice, sort, page = 1, limit = 12, featured } = req.query;

  const filter = { isActive: true };
  if (search) filter.$text = { $search: search };
  if (category) filter.category = category;
  if (featured) filter.isFeatured = featured === 'true';
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  const sortOptions = {
    'price-asc': { price: 1 },
    'price-desc': { price: -1 },
    rating: { ratingsAverage: -1 },
    popular: { bookingsCount: -1 },
    newest: { createdAt: -1 },
  };

  const skip = (Number(page) - 1) * Number(limit);

  const [services, total] = await Promise.all([
    Service.find(filter)
      .populate('category', 'name slug')
      .sort(sortOptions[sort] || { createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Service.countDocuments(filter),
  ]);

  res.status(200).json(
    new ApiResponse(200, {
      services,
      pagination: { total, page: Number(page), pages: Math.ceil(total / limit) },
    })
  );
});

const getServiceBySlug = asyncHandler(async (req, res) => {
  const service = await Service.findOne({ slug: req.params.slug, isActive: true })
    .populate('category', 'name slug')
    .populate({
      path: 'availableTherapists',
      populate: { path: 'user', select: 'name avatar' },
    });

  if (!service) throw new ApiError(404, 'Service not found');
  res.status(200).json(new ApiResponse(200, { service }));
});

const createService = asyncHandler(async (req, res) => {
  const { title, description, benefits, category, durationMinutes, price, discountPrice, isFeatured } =
    req.body;

  const images = [];
  if (req.files && req.files.length) {
    for (const file of req.files) {
      images.push(await uploadToCloudinary(file.buffer, 'spa-booking/services'));
    }
  }

  const service = await Service.create({
    title,
    slug: slugify(title),
    description,
    benefits: Array.isArray(benefits) ? benefits : benefits ? benefits.split(',').map((b) => b.trim()) : [],
    category,
    durationMinutes,
    price,
    discountPrice: discountPrice || 0,
    isFeatured: !!isFeatured,
    images,
  });

  res.status(201).json(new ApiResponse(201, { service }, 'Service created'));
});

const updateService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);
  if (!service) throw new ApiError(404, 'Service not found');

  const fields = ['title', 'description', 'category', 'durationMinutes', 'price', 'discountPrice', 'isFeatured', 'isActive'];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) service[f] = req.body[f];
  });
  if (req.body.benefits) {
    service.benefits = Array.isArray(req.body.benefits)
      ? req.body.benefits
      : req.body.benefits.split(',').map((b) => b.trim());
  }

  if (req.files && req.files.length) {
    for (const file of req.files) {
      service.images.push(await uploadToCloudinary(file.buffer, 'spa-booking/services'));
    }
  }

  await service.save();
  res.status(200).json(new ApiResponse(200, { service }, 'Service updated'));
});

const deleteService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);
  if (!service) throw new ApiError(404, 'Service not found');
  for (const img of service.images) {
    await deleteFromCloudinary(img.publicId);
  }
  await service.deleteOne();
  res.status(200).json(new ApiResponse(200, null, 'Service deleted'));
});

module.exports = {
  getServices,
  getServiceBySlug,
  createService,
  updateService,
  deleteService,
};
