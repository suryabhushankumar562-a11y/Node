const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    siteName: { type: String, default: 'Luxe Spa & Wellness' },
    logo: { url: String, publicId: String },
    favicon: { url: String, publicId: String },
    contact: {
      email: String,
      phone: String,
      address: String,
      mapEmbedUrl: String,
    },
    socialLinks: {
      facebook: String,
      instagram: String,
      twitter: String,
      youtube: String,
    },
    seo: {
      metaTitle: String,
      metaDescription: String,
      keywords: [String],
    },
    businessHours: [
      {
        day: String,
        openTime: String,
        closeTime: String,
        isClosed: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Settings', settingsSchema);
