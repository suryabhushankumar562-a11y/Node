const asyncHandler = require('express-async-handler');
const Coupon = require('../models/Coupon');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

const getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  res.status(200).json(new ApiResponse(200, { coupons }));
});

const createCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.create({ ...req.body, code: req.body.code.toUpperCase() });
  res.status(201).json(new ApiResponse(201, { coupon }, 'Coupon created'));
});

const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!coupon) throw new ApiError(404, 'Coupon not found');
  res.status(200).json(new ApiResponse(200, { coupon }, 'Coupon updated'));
});

const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);
  if (!coupon) throw new ApiError(404, 'Coupon not found');
  res.status(200).json(new ApiResponse(200, null, 'Coupon deleted'));
});

const validateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findOne({ code: req.params.code.toUpperCase(), isActive: true });
  if (!coupon) throw new ApiError(404, 'Invalid coupon code');
  if (coupon.validTill < new Date()) throw new ApiError(400, 'Coupon has expired');
  if (coupon.usedCount >= coupon.usageLimit) throw new ApiError(400, 'Coupon usage limit reached');
  res.status(200).json(new ApiResponse(200, { coupon }, 'Coupon is valid'));
});

module.exports = { getCoupons, createCoupon, updateCoupon, deleteCoupon, validateCoupon };
