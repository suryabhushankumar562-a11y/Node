const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    bookingCode: { type: String, required: true, unique: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
    therapist: { type: mongoose.Schema.Types.ObjectId, ref: 'Therapist', required: true },
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    address: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      pincode: String,
    },
    priceDetails: {
      basePrice: { type: Number, required: true },
      discount: { type: Number, default: 0 },
      couponCode: { type: String, default: null },
      giftCardCode: { type: String, default: null },
      taxAmount: { type: Number, default: 0 },
      totalAmount: { type: Number, required: true },
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'rescheduled'],
      default: 'pending',
    },
    payment: {
      status: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
      method: { type: String, enum: ['razorpay', 'wallet', 'cash'], default: 'razorpay' },
      razorpayOrderId: String,
      razorpayPaymentId: String,
      razorpaySignature: String,
      paidAt: Date,
    },
    cancellation: {
      cancelledBy: { type: String, enum: ['customer', 'admin', 'receptionist', null], default: null },
      reason: String,
      cancelledAt: Date,
    },
    rescheduleHistory: [
      {
        oldDate: Date,
        oldStartTime: String,
        newDate: Date,
        newStartTime: String,
        rescheduledAt: { type: Date, default: Date.now },
      },
    ],
    notes: String,
    isReviewed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

bookingSchema.index({ customer: 1, createdAt: -1 });
bookingSchema.index({ therapist: 1, date: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ bookingCode: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
