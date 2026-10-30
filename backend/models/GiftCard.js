const mongoose = require('mongoose');

const giftCardSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    amount: { type: Number, required: true, min: 0 },
    balance: { type: Number, required: true, min: 0 },
    purchasedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    redeemedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    expiryDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('GiftCard', giftCardSchema);
