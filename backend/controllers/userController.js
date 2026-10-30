const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { uploadToCloudinary, deleteFromCloudinary } = require('../services/cloudinaryService');

// @route PUT /api/v1/users/profile  (self update)
const updateProfile = asyncHandler(async (req, res) => {
  const { name, gender, dob } = req.body;
  const user = await User.findById(req.user._id);

  if (name) user.name = name;
  if (gender) user.gender = gender;
  if (dob) user.dob = dob;

  if (req.file) {
    await deleteFromCloudinary(user.avatar?.publicId);
    user.avatar = await uploadToCloudinary(req.file.buffer, 'spa-booking/avatars');
  }

  await user.save();
  res.status(200).json(new ApiResponse(200, { user: user.toSafeObject() }, 'Profile updated'));
});

// @route POST /api/v1/users/addresses
const addAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (req.body.isDefault) user.addresses.forEach((a) => (a.isDefault = false));
  user.addresses.push(req.body);
  await user.save();
  res.status(201).json(new ApiResponse(201, { addresses: user.addresses }, 'Address added'));
});

const deleteAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.addresses = user.addresses.filter((a) => a._id.toString() !== req.params.addressId);
  await user.save();
  res.status(200).json(new ApiResponse(200, { addresses: user.addresses }, 'Address removed'));
});

// @route POST/DELETE /api/v1/users/wishlist/:serviceId
const toggleWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const idx = user.wishlist.findIndex((id) => id.toString() === req.params.serviceId);
  if (idx > -1) user.wishlist.splice(idx, 1);
  else user.wishlist.push(req.params.serviceId);
  await user.save();
  res.status(200).json(new ApiResponse(200, { wishlist: user.wishlist }, 'Wishlist updated'));
});

// @route GET /api/v1/users  (admin - list/search/filter/paginate)
const getUsers = asyncHandler(async (req, res) => {
  const { role, search, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }
  const skip = (Number(page) - 1) * Number(limit);
  const [users, total] = await Promise.all([
    User.find(filter).skip(skip).limit(Number(limit)).sort({ createdAt: -1 }),
    User.countDocuments(filter),
  ]);
  res
    .status(200)
    .json(new ApiResponse(200, { users, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } }));
});

// @route PATCH /api/v1/users/:id/status  (admin activate/deactivate)
const toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');
  user.isActive = req.body.isActive;
  await user.save();
  res.status(200).json(new ApiResponse(200, { user: user.toSafeObject() }, 'User status updated'));
});

// @route PATCH /api/v1/users/:id/role  (admin assigns receptionist/therapist/admin role)
const updateUserRole = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');
  user.role = req.body.role;
  await user.save();
  res.status(200).json(new ApiResponse(200, { user: user.toSafeObject() }, 'User role updated'));
});

module.exports = {
  updateProfile,
  addAddress,
  deleteAddress,
  toggleWishlist,
  getUsers,
  toggleUserStatus,
  updateUserRole,
};
