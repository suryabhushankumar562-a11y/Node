const asyncHandler = require('express-async-handler');
const Therapist = require('../models/Therapist');
const Booking = require('../models/Booking');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

// @route GET /api/v1/therapists  (public)
const getTherapists = asyncHandler(async (req, res) => {
  const { specialization, page = 1, limit = 12 } = req.query;
  const filter = { isActive: true, isVerified: true };
  if (specialization) filter.specializations = specialization;

  const skip = (Number(page) - 1) * Number(limit);
  const [therapists, total] = await Promise.all([
    Therapist.find(filter)
      .populate('user', 'name avatar')
      .populate('specializations', 'name')
      .sort({ ratingsAverage: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Therapist.countDocuments(filter),
  ]);

  res
    .status(200)
    .json(new ApiResponse(200, { therapists, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } }));
});

const getTherapistById = asyncHandler(async (req, res) => {
  const therapist = await Therapist.findById(req.params.id)
    .populate('user', 'name avatar phone email')
    .populate('specializations', 'name')
    .populate('services', 'title price durationMinutes');
  if (!therapist) throw new ApiError(404, 'Therapist not found');
  res.status(200).json(new ApiResponse(200, { therapist }));
});

// @route POST /api/v1/therapists  (admin creates a therapist profile from an existing user)
const createTherapistProfile = asyncHandler(async (req, res) => {
  const { userId, bio, specializations, experienceYears, weeklyAvailability } = req.body;

  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'User not found');
  user.role = 'therapist';
  await user.save();

  const existing = await Therapist.findOne({ user: userId });
  if (existing) throw new ApiError(409, 'Therapist profile already exists for this user');

  const therapist = await Therapist.create({
    user: userId,
    bio,
    specializations,
    experienceYears,
    weeklyAvailability,
  });

  res.status(201).json(new ApiResponse(201, { therapist }, 'Therapist profile created'));
});

// @route PUT /api/v1/therapists/:id  (self-update or admin)
const updateTherapistProfile = asyncHandler(async (req, res) => {
  const therapist = await Therapist.findById(req.params.id);
  if (!therapist) throw new ApiError(404, 'Therapist not found');

  const isSelf = therapist.user.toString() === req.user._id.toString();
  if (!isSelf && req.user.role !== 'admin') throw new ApiError(403, 'Not authorized');

  const fields = ['bio', 'specializations', 'experienceYears', 'weeklyAvailability', 'services'];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) therapist[f] = req.body[f];
  });
  if (req.user.role === 'admin' && req.body.isVerified !== undefined) {
    therapist.isVerified = req.body.isVerified;
  }

  await therapist.save();
  res.status(200).json(new ApiResponse(200, { therapist }, 'Therapist profile updated'));
});

// @route POST /api/v1/therapists/:id/leaves
const applyLeave = asyncHandler(async (req, res) => {
  const therapist = await Therapist.findById(req.params.id);
  if (!therapist) throw new ApiError(404, 'Therapist not found');
  if (therapist.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Not authorized to apply leave for this profile');
  }
  therapist.leaves.push({ date: req.body.date, reason: req.body.reason });
  await therapist.save();
  res.status(201).json(new ApiResponse(201, { therapist }, 'Leave request submitted'));
});

// @route PATCH /api/v1/therapists/:id/leaves/:leaveId  (admin approves/rejects)
const decideLeave = asyncHandler(async (req, res) => {
  const therapist = await Therapist.findById(req.params.id);
  if (!therapist) throw new ApiError(404, 'Therapist not found');
  const leave = therapist.leaves.id(req.params.leaveId);
  if (!leave) throw new ApiError(404, 'Leave request not found');
  leave.status = req.body.status; // 'approved' | 'rejected'
  await therapist.save();
  res.status(200).json(new ApiResponse(200, { therapist }, `Leave ${req.body.status}`));
});

// @route GET /api/v1/therapists/:id/bookings  (therapist's assigned bookings)
const getAssignedBookings = asyncHandler(async (req, res) => {
  const therapist = await Therapist.findById(req.params.id);
  if (!therapist) throw new ApiError(404, 'Therapist not found');
  if (therapist.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, 'Not authorized');
  }

  const { status, from, to } = req.query;
  const filter = { therapist: therapist._id };
  if (status) filter.status = status;
  if (from || to) {
    filter.date = {};
    if (from) filter.date.$gte = new Date(from);
    if (to) filter.date.$lte = new Date(to);
  }

  const bookings = await Booking.find(filter)
    .populate('customer', 'name phone')
    .populate('service', 'title durationMinutes')
    .sort({ date: 1, startTime: 1 });

  res.status(200).json(new ApiResponse(200, { bookings }));
});

module.exports = {
  getTherapists,
  getTherapistById,
  createTherapistProfile,
  updateTherapistProfile,
  applyLeave,
  decideLeave,
  getAssignedBookings,
};
