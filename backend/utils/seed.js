/**
 * Seed script - populates the database with a demo admin, categories,
 * services, and a therapist so the app is usable immediately after setup.
 * Run with: npm run seed
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Category = require('../models/Category');
const Service = require('../models/Service');
const Therapist = require('../models/Therapist');
const MembershipPlan = require('../models/MembershipPlan');

const run = async () => {
  await connectDB();

  await Promise.all([
    User.deleteMany({ email: { $in: ['admin@luxespa.com', 'therapist@luxespa.com'] } }),
    Category.deleteMany({}),
    Service.deleteMany({}),
    Therapist.deleteMany({}),
    MembershipPlan.deleteMany({}),
  ]);

  const admin = await User.create({
    name: 'Super Admin',
    email: 'admin@luxespa.com',
    phone: '9999999999',
    password: 'Admin@123',
    role: 'admin',
    referralCode: 'ADMIN001',
  });

  const therapistUser = await User.create({
    name: 'Ananya Sharma',
    email: 'therapist@luxespa.com',
    phone: '8888888888',
    password: 'Therapist@123',
    role: 'therapist',
    referralCode: 'THER001',
  });

  const category = await Category.create({
    name: 'Swedish Massage',
    slug: 'swedish-massage',
    description: 'Relaxing full-body massage therapies',
  });

  const therapist = await Therapist.create({
    user: therapistUser._id,
    bio: 'Certified massage therapist with 8 years of experience in Swedish and deep tissue therapies.',
    experienceYears: 8,
    isVerified: true,
    weeklyAvailability: [
      { day: 'monday', startTime: '09:00', endTime: '18:00' },
      { day: 'tuesday', startTime: '09:00', endTime: '18:00' },
      { day: 'wednesday', startTime: '09:00', endTime: '18:00' },
    ],
  });

  const service = await Service.create({
    title: 'Signature Swedish Massage',
    slug: 'signature-swedish-massage',
    description: 'A gentle full-body massage designed to relax muscles and improve circulation.',
    benefits: ['Reduces stress', 'Improves circulation', 'Relieves muscle tension'],
    category: category._id,
    durationMinutes: 60,
    price: 2499,
    discountPrice: 1999,
    isFeatured: true,
    availableTherapists: [therapist._id],
  });

  therapist.services.push(service._id);
  await therapist.save();

  await MembershipPlan.insertMany([
    { name: 'silver', price: 1999, durationMonths: 12, discountPercentage: 5, benefits: ['5% off all services'] },
    { name: 'gold', price: 3999, durationMonths: 12, discountPercentage: 10, benefits: ['10% off all services', 'Priority booking'] },
    { name: 'platinum', price: 6999, durationMonths: 12, discountPercentage: 15, benefits: ['15% off all services', 'Priority booking', 'Free monthly session'] },
  ]);

  console.log('Seed complete:');
  console.log(`  Admin login      -> admin@luxespa.com / Admin@123`);
  console.log(`  Therapist login  -> therapist@luxespa.com / Therapist@123`);

  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
