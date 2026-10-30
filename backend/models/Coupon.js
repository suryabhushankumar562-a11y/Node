const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: {
      type: String,
      enum: ['promo', 'festival', 'referral', 'combo'],
      default: 'promo',
    },
    discountType: { type: String, enum: ['percentage', 'flat'], required: true },
    discountValue: { type: Number, required: true },
    maxDiscountAmount: { type: Number, default: null },
    minOrderAmount: { type: Number, default: 0 },
    applicableServices: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],
    applicableMembershipPlans: [{ type: String, enum: ['none', 'silver', 'gold', 'platinum'] }],
    usageLimit: { type: Number, default: 100 },
    usedCount: { type: Number, default: 0 },
    perUserLimit: { type: Number, default: 1 },
    validFrom: { type: Date, required: true },
    validTill: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

couponSchema.index({ code: 1 });
couponSchema.index({ validTill: 1 });

module.exports = mongoose.model('Coupon', couponSchema);
