const { body } = require('express-validator');

const createBookingValidator = [
  body('serviceId').isMongoId().withMessage('Valid serviceId is required'),
  body('therapistId').isMongoId().withMessage('Valid therapistId is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('startTime')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('startTime must be in HH:mm format'),
  body('address.city').notEmpty().withMessage('City is required'),
  body('address.pincode').notEmpty().withMessage('Pincode is required'),
];

const verifyPaymentValidator = [
  body('bookingId').isMongoId().withMessage('Valid bookingId is required'),
  body('razorpay_order_id').notEmpty(),
  body('razorpay_payment_id').notEmpty(),
  body('razorpay_signature').notEmpty(),
];

const rescheduleValidator = [
  body('date').isISO8601().withMessage('Valid date is required'),
  body('startTime')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('startTime must be in HH:mm format'),
];

module.exports = { createBookingValidator, verifyPaymentValidator, rescheduleValidator };
