const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    coverImage: { url: String, publicId: String },
    content: { type: String, required: true },
    excerpt: { type: String, maxlength: 300 },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    tags: [String],
    isPublished: { type: Boolean, default: false },
    seo: {
      metaTitle: String,
      metaDescription: String,
      keywords: [String],
    },
  },
  { timestamps: true }
);

blogSchema.index({ title: 'text', content: 'text' });

module.exports = mongoose.model('Blog', blogSchema);
