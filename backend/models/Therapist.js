const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    reason: String,
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  },
  { _id: true }
);

const slotSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
      required: true,
    },
    startTime: { type: String, required: true }, // "09:00"
    endTime: { type: String, required: true }, // "18:00"
    isAvailable: { type: Boolean, default: true },
  },
  { _id: false }
);

const therapistSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    bio: { type: String, maxlength: 1000 },
    specializations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
    services: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],
    experienceYears: { type: Number, default: 0 },
    certificates: [
      {
        title: String,
        fileUrl: String,
        issuedBy: String,
        issuedYear: Number,
      },
    ],
    weeklyAvailability: [slotSchema],
    leaves: [leaveSchema],
    ratingsAverage: { type: Number, default: 0, min: 0, max: 5 },
    ratingsCount: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

therapistSchema.index({ specializations: 1 });
therapistSchema.index({ ratingsAverage: -1 });

module.exports = mongoose.model('Therapist', therapistSchema);
