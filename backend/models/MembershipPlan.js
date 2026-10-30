const mongoose = require('mongoose');

const membershipPlanSchema = new mongoose.Schema(
  {
    name: { type: String, enum: ['silver', 'gold', 'platinum'], required: true, unique: true },
    price: { type: Number, required: true },
    durationMonths: { type: Number, required: true, default: 12 },
    benefits: [String],
    discountPercentage: { type: Number, default: 0 },
    rewardPointsMultiplier: { type: Number, default: 1 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MembershipPlan', membershipPlanSchema);
