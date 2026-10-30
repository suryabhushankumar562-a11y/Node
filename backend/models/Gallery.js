const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema(
  {
    title: String,
    image: { url: String, publicId: String, required: true },
    category: { type: String, default: 'general' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Gallery', gallerySchema);
