const asyncHandler = require('express-async-handler');
const Category = require('../models/Category');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { uploadToCloudinary, deleteFromCloudinary } = require('../services/cloudinaryService');

const slugify = (str) =>
  str.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-');

const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort('name');
  res.status(200).json(new ApiResponse(200, { categories }));
});

const createCategory = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  let image;
  if (req.file) {
    image = await uploadToCloudinary(req.file.buffer, 'spa-booking/categories');
  }
  const category = await Category.create({ name, description, slug: slugify(name), image });
  res.status(201).json(new ApiResponse(201, { category }, 'Category created'));
});

const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw new ApiError(404, 'Category not found');

  if (req.file) {
    await deleteFromCloudinary(category.image?.publicId);
    category.image = await uploadToCloudinary(req.file.buffer, 'spa-booking/categories');
  }

  const { name, description, isActive } = req.body;
  if (name) {
    category.name = name;
    category.slug = slugify(name);
  }
  if (description !== undefined) category.description = description;
  if (isActive !== undefined) category.isActive = isActive;

  await category.save();
  res.status(200).json(new ApiResponse(200, { category }, 'Category updated'));
});

const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw new ApiError(404, 'Category not found');
  await deleteFromCloudinary(category.image?.publicId);
  await category.deleteOne();
  res.status(200).json(new ApiResponse(200, null, 'Category deleted'));
});

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
