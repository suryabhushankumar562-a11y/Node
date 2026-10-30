const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const Therapist = require('../models/Therapist');
const Coupon = require('../models/Coupon');
const GiftCard = require('../models/GiftCard');
const razorpayInstance = require('../config/razorpay');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { sendEmail, emailTemplates } = require('../services/emailService');
const { createNotification } = require('../services/notificationService');

const generateBookingCode = () => 'SPA-' + crypto.randomBytes(4).toString('hex').toUpperCase();

// Check therapist availability for a given date/time by looking for overlapping bookings
const isTherapistAvailable = async (therapistId, date, startTime, endTime, excludeBookingId = null) => {
  const query = {
    therapist: therapistId,
    date: new Date(date),
    status: { $in: ['pending', 'confirmed', 'in-progress'] },
    $or: [{ startTime: { $lt: endTime }, endTime: { $gt: startTime } }],
  };
  if (excludeBookingId) query._id = { $ne: excludeBookingId };
  const conflict = await Booking.findOne(query);
  return !conflict;
};

const computeEndTime = (startTime, durationMinutes) => {
  const [h, m] = startTime.split(':').map(Number);
  const total = h * 60 + m + durationMinutes;
  const endH = Math.floor(total / 60) % 24;
  const endM = total % 60;
  return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
};

// @route POST /api/v1/bookings  (creates booking + razorpay order)
const createBooking = asyncHandler(async (req, res) => {
  const { serviceId, therapistId, date, startTime, address, couponCode, giftCardCode, notes } = req.body;

  const service = await Service.findById(serviceId);
  if (!service || !service.isActive) throw new ApiError(404, 'Service not found');

  const therapist = await Therapist.findById(therapistId);
  if (!therapist || !therapist.isActive) throw new ApiError(404, 'Therapist not found');

  const endTime = computeEndTime(startTime, service.durationMinutes);

  const available = await isTherapistAvailable(therapistId, date, startTime, endTime);
  if (!available) throw new ApiError(409, 'Therapist is not available at the selected time slot');

  let basePrice = service.finalPrice ?? (service.discountPrice > 0 ? service.discountPrice : service.price);
  let discount = 0;
  let appliedCoupon = null;
  let appliedGiftCard = null;

  if (couponCode) {
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
    if (!coupon) throw new ApiError(400, 'Invalid coupon code');
    if (coupon.validTill < new Date()) throw new ApiError(400, 'Coupon has expired');
    if (coupon.usedCount >= coupon.usageLimit) throw new ApiError(400, 'Coupon usage limit reached');
    if (basePrice < coupon.minOrderAmount) {
      throw new ApiError(400, `Minimum order amount for this coupon is ₹${coupon.minOrderAmount}`);
    }
    discount =
      coupon.discountType === 'percentage' ? (basePrice * coupon.discountValue) / 100 : coupon.discountValue;
    if (coupon.maxDiscountAmount) discount = Math.min(discount, coupon.maxDiscountAmount);
    appliedCoupon = coupon;
  }

  let totalAmount = Math.max(basePrice - discount, 0);

  if (giftCardCode) {
    const giftCard = await GiftCard.findOne({ code: giftCardCode.toUpperCase(), isActive: true });
    if (!giftCard) throw new ApiError(400, 'Invalid gift card code');
    if (giftCard.expiryDate < new Date()) throw new ApiError(400, 'Gift card has expired');
    if (giftCard.balance <= 0) throw new ApiError(400, 'Gift card has no remaining balance');
    const redeemAmount = Math.min(giftCard.balance, totalAmount);
    totalAmount -= redeemAmount;
    appliedGiftCard = { doc: giftCard, redeemAmount };
  }

  const taxAmount = Math.round(totalAmount * 0.05 * 100) / 100; // 5% GST example
  totalAmount = Math.round((totalAmount + taxAmount) * 100) / 100;

  const booking = await Booking.create({
    bookingCode: generateBookingCode(),
    customer: req.user._id,
    service: service._id,
    therapist: therapist._id,
    date,
    startTime,
    endTime,
    address,
    notes,
    priceDetails: {
      basePrice,
      discount,
      couponCode: appliedCoupon?.code || null,
      giftCardCode: appliedGiftCard ? giftCardCode.toUpperCase() : null,
      taxAmount,
      totalAmount,
    },
    status: 'pending',
  });

  // create razorpay order (amount in paise)
  const order = await razorpayInstance.orders.create({
    amount: Math.round(totalAmount * 100),
    currency: 'INR',
    receipt: booking.bookingCode,
    notes: { bookingId: booking._id.toString() },
  });

  booking.payment.razorpayOrderId = order.id;
  await booking.save();

  if (appliedCoupon) {
    appliedCoupon.usedCount += 1;
    await appliedCoupon.save();
  }
  if (appliedGiftCard) {
    appliedGiftCard.doc.balance -= appliedGiftCard.redeemAmount;
    appliedGiftCard.doc.redeemedBy.push(req.user._id);
    await appliedGiftCard.doc.save();
  }

  res.status(201).json(
    new ApiResponse(
      201,
      {
        booking,
        razorpayOrder: order,
        razorpayKeyId: process.env.RAZORPAY_KEY_ID,
      },
      'Booking created, proceed to payment'
    )
  );
});

// @route POST /api/v1/bookings/verify-payment
const verifyPayment = asyncHandler(async (req, res) => {
  const { bookingId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const booking = await Booking.findById(bookingId).populate('service').populate('customer');
  if (!booking) throw new ApiError(404, 'Booking not found');

  const generatedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (generatedSignature !== razorpay_signature) {
    booking.payment.status = 'failed';
    await booking.save();
    throw new ApiError(400, 'Payment verification failed. Signature mismatch.');
  }

  booking.payment.status = 'paid';
  booking.payment.razorpayPaymentId = razorpay_payment_id;
  booking.payment.razorpaySignature = razorpay_signature;
  booking.payment.paidAt = new Date();
  booking.status = 'confirmed';
  await booking.save();

  await Service.findByIdAndUpdate(booking.service._id, { $inc: { bookingsCount: 1 } });

  await createNotification({
    user: booking.customer._id,
    title: 'Payment Successful',
    message: `Payment for booking ${booking.bookingCode} was successful.`,
    type: 'payment',
  });

  sendEmail({
    to: booking.customer.email,
    subject: 'Booking Confirmed - Luxe Spa & Wellness',
    html: emailTemplates.bookingConfirmation(booking),
  });

  res.status(200).json(new ApiResponse(200, { booking }, 'Payment verified, booking confirmed'));
});

// @route GET /api/v1/bookings/my
const getMyBookings = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const filter = { customer: req.user._id };
  if (status) filter.status = status;

  const skip = (Number(page) - 1) * Number(limit);
  const [bookings, total] = await Promise.all([
    Booking.find(filter)
      .populate('service', 'title images durationMinutes')
      .populate({ path: 'therapist', populate: { path: 'user', select: 'name avatar' } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Booking.countDocuments(filter),
  ]);

  res
    .status(200)
    .json(new ApiResponse(200, { bookings, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } }));
});

// @route GET /api/v1/bookings/:id
const getBookingById = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('service')
    .populate({ path: 'therapist', populate: { path: 'user', select: 'name avatar phone' } })
    .populate('customer', 'name email phone');

  if (!booking) throw new ApiError(404, 'Booking not found');

  const isOwner = booking.customer._id.toString() === req.user._id.toString();
  const isStaff = ['admin', 'receptionist', 'therapist'].includes(req.user.role);
  if (!isOwner && !isStaff) throw new ApiError(403, 'Not authorized to view this booking');

  res.status(200).json(new ApiResponse(200, { booking }));
});

// @route PATCH /api/v1/bookings/:id/reschedule
const rescheduleBooking = asyncHandler(async (req, res) => {
  const { date, startTime } = req.body;
  const booking = await Booking.findById(req.params.id).populate('service');
  if (!booking) throw new ApiError(404, 'Booking not found');
  if (booking.customer.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Not authorized to reschedule this booking');
  }
  if (!['pending', 'confirmed'].includes(booking.status)) {
    throw new ApiError(400, `Cannot reschedule a booking with status '${booking.status}'`);
  }

  const endTime = computeEndTime(startTime, booking.service.durationMinutes);
  const available = await isTherapistAvailable(booking.therapist, date, startTime, endTime, booking._id);
  if (!available) throw new ApiError(409, 'Therapist is not available at the selected time slot');

  booking.rescheduleHistory.push({
    oldDate: booking.date,
    oldStartTime: booking.startTime,
    newDate: date,
    newStartTime: startTime,
  });
  booking.date = date;
  booking.startTime = startTime;
  booking.endTime = endTime;
  booking.status = 'rescheduled';
  await booking.save();

  res.status(200).json(new ApiResponse(200, { booking }, 'Booking rescheduled successfully'));
});

// @route PATCH /api/v1/bookings/:id/cancel
const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate('customer');
  if (!booking) throw new ApiError(404, 'Booking not found');

  const isOwner = booking.customer._id.toString() === req.user._id.toString();
  const isStaff = ['admin', 'receptionist'].includes(req.user.role);
  if (!isOwner && !isStaff) throw new ApiError(403, 'Not authorized to cancel this booking');

  if (['completed', 'cancelled'].includes(booking.status)) {
    throw new ApiError(400, `Booking is already ${booking.status}`);
  }

  booking.status = 'cancelled';
  booking.cancellation = {
    cancelledBy: isStaff ? req.user.role : 'customer',
    reason: req.body.reason || 'Not specified',
    cancelledAt: new Date(),
  };
  if (booking.payment.status === 'paid') {
    booking.payment.status = 'refunded'; // sandbox: mark refunded; real refund via razorpay.payments.refund
  }
  await booking.save();

  await createNotification({
    user: booking.customer._id,
    title: 'Booking Cancelled',
    message: `Your booking ${booking.bookingCode} has been cancelled.`,
    type: 'cancellation',
  });

  sendEmail({
    to: booking.customer.email,
    subject: 'Booking Cancelled - Luxe Spa & Wellness',
    html: emailTemplates.cancellation(booking),
  });

  res.status(200).json(new ApiResponse(200, { booking }, 'Booking cancelled'));
});

// @route GET /api/v1/bookings  (admin/receptionist - all bookings)
const getAllBookings = asyncHandler(async (req, res) => {
  const { status, therapist, from, to, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (therapist) filter.therapist = therapist;
  if (from || to) {
    filter.date = {};
    if (from) filter.date.$gte = new Date(from);
    if (to) filter.date.$lte = new Date(to);
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [bookings, total] = await Promise.all([
    Booking.find(filter)
      .populate('customer', 'name email phone')
      .populate('service', 'title')
      .populate({ path: 'therapist', populate: { path: 'user', select: 'name' } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Booking.countDocuments(filter),
  ]);

  res
    .status(200)
    .json(new ApiResponse(200, { bookings, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } }));
});

module.exports = {
  createBooking,
  verifyPayment,
  getMyBookings,
  getBookingById,
  rescheduleBooking,
  cancelBooking,
  getAllBookings,
};
