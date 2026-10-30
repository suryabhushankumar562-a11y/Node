const asyncHandler = require('express-async-handler');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Service = require('../models/Service');
const Therapist = require('../models/Therapist');
const ApiResponse = require('../utils/ApiResponse');

// @route GET /api/v1/admin/dashboard
const getDashboardStats = asyncHandler(async (req, res) => {
  const [totalUsers, totalTherapists, totalBookings, revenueAgg, todayBookings] = await Promise.all([
    User.countDocuments({ role: 'customer' }),
    Therapist.countDocuments(),
    Booking.countDocuments(),
    Booking.aggregate([
      { $match: { 'payment.status': 'paid' } },
      { $group: { _id: null, total: { $sum: '$priceDetails.totalAmount' } } },
    ]),
    Booking.countDocuments({ date: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } }),
  ]);

  res.status(200).json(
    new ApiResponse(200, {
      totalUsers,
      totalTherapists,
      totalBookings,
      totalRevenue: revenueAgg[0]?.total || 0,
      todayBookings,
    })
  );
});

// @route GET /api/v1/admin/reports/revenue?period=daily|monthly|yearly
const getRevenueReport = asyncHandler(async (req, res) => {
  const { period = 'daily' } = req.query;

  const groupFormat = {
    daily: '%Y-%m-%d',
    monthly: '%Y-%m',
    yearly: '%Y',
  }[period] || '%Y-%m-%d';

  const report = await Booking.aggregate([
    { $match: { 'payment.status': 'paid' } },
    {
      $group: {
        _id: { $dateToString: { format: groupFormat, date: '$date' } },
        revenue: { $sum: '$priceDetails.totalAmount' },
        bookings: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.status(200).json(new ApiResponse(200, { report }));
});

// @route GET /api/v1/admin/reports/most-booked-services
const getMostBookedServices = asyncHandler(async (req, res) => {
  const report = await Booking.aggregate([
    { $group: { _id: '$service', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
    { $lookup: { from: 'services', localField: '_id', foreignField: '_id', as: 'service' } },
    { $unwind: '$service' },
    { $project: { count: 1, 'service.title': 1, 'service.price': 1 } },
  ]);
  res.status(200).json(new ApiResponse(200, { report }));
});

// @route GET /api/v1/admin/reports/most-active-customers
const getMostActiveCustomers = asyncHandler(async (req, res) => {
  const report = await Booking.aggregate([
    { $group: { _id: '$customer', bookingsCount: { $sum: 1 }, totalSpent: { $sum: '$priceDetails.totalAmount' } } },
    { $sort: { bookingsCount: -1 } },
    { $limit: 10 },
    { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'customer' } },
    { $unwind: '$customer' },
    { $project: { bookingsCount: 1, totalSpent: 1, 'customer.name': 1, 'customer.email': 1 } },
  ]);
  res.status(200).json(new ApiResponse(200, { report }));
});

// @route GET /api/v1/admin/reports/therapist-performance
const getTherapistPerformance = asyncHandler(async (req, res) => {
  const report = await Booking.aggregate([
    { $match: { status: 'completed' } },
    {
      $group: {
        _id: '$therapist',
        completedBookings: { $sum: 1 },
        revenueGenerated: { $sum: '$priceDetails.totalAmount' },
      },
    },
    { $sort: { completedBookings: -1 } },
    { $lookup: { from: 'therapists', localField: '_id', foreignField: '_id', as: 'therapist' } },
    { $unwind: '$therapist' },
    { $lookup: { from: 'users', localField: 'therapist.user', foreignField: '_id', as: 'user' } },
    { $unwind: '$user' },
    {
      $project: {
        completedBookings: 1,
        revenueGenerated: 1,
        ratingsAverage: '$therapist.ratingsAverage',
        'user.name': 1,
      },
    },
  ]);
  res.status(200).json(new ApiResponse(200, { report }));
});

// @route GET /api/v1/admin/reports/booking-stats
const getBookingStatistics = asyncHandler(async (req, res) => {
  const stats = await Booking.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);
  res.status(200).json(new ApiResponse(200, { stats }));
});

module.exports = {
  getDashboardStats,
  getRevenueReport,
  getMostBookedServices,
  getMostActiveCustomers,
  getTherapistPerformance,
  getBookingStatistics,
};
