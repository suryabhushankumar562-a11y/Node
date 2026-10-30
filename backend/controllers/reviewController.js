const asyncHandler = require('express-async-handler');
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const Therapist = require('../models/Therapist');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

const recalculateRatings = async (serviceId, therapistId) => {
  const [serviceAgg] = await Review.aggregate([
    { $match: { service: serviceId } },
    { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  await Service.findByIdAndUpdate(serviceId, {
    ratingsAverage: serviceAgg?.avg || 0,
    ratingsCount: serviceAgg?.count || 0,
  });

  if (therapistId) {
    const [therapistAgg] = await Review.aggregate([
      { $match: { therapist: therapistId } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    await Therapist.findByIdAndUpdate(therapistId, {
      ratingsAverage: therapistAgg?.avg || 0,
      ratingsCount: therapistAgg?.count || 0,
    });
  }
};

const createReview = asyncHandler(async (req, res) => {
  const { bookingId, rating, comment } = req.body;
  const booking = await Booking.findById(bookingId);
  if (!booking) throw new ApiError(404, 'Booking not found');
  if (booking.customer.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Not authorized to review this booking');
  }
  if (booking.status !== 'completed') throw new ApiError(400, 'Can only review completed bookings');
  if (booking.isReviewed) throw new ApiError(400, 'This booking has already been reviewed');

  const review = await Review.create({
    customer: req.user._id,
    booking: bookingId,
    service: booking.service,
    therapist: booking.therapist,
    rating,
    comment,
  });

  booking.isReviewed = true;
  await booking.save();
  await recalculateRatings(booking.service, booking.therapist);

  res.status(201).json(new ApiResponse(201, { review }, 'Review submitted'));
});

const getServiceReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ service: req.params.serviceId, isApproved: true })
    .populate('customer', 'name avatar')
    .sort({ createdAt: -1 });
  res.status(200).json(new ApiResponse(200, { reviews }));
});

const moderateReview = asyncHandler(async (req, res) => {
  const review = await Review.findByIdAndUpdate(
    req.params.id,
    { isApproved: req.body.isApproved },
    { new: true }
  );
  if (!review) throw new ApiError(404, 'Review not found');
  res.status(200).json(new ApiResponse(200, { review }, 'Review moderated'));
});

module.exports = { createReview, getServiceReviews, moderateReview };
