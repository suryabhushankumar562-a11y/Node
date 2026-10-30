const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require('../utils/generateTokens');
const { sendEmail, emailTemplates } = require('../services/emailService');

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
};

const issueTokens = async (user, res) => {
  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshTokens.push({ token: refreshToken });
  // keep only the last 5 refresh tokens per user (multi-device support, capped)
  if (user.refreshTokens.length > 5) {
    user.refreshTokens = user.refreshTokens.slice(-5);
  }
  await user.save();

  res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
  return accessToken;
};

// @route POST /api/v1/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, phone, password, referralCode } = req.body;

  const existing = await User.findOne({ $or: [{ email }, { phone }] });
  if (existing) {
    throw new ApiError(409, 'An account with this email or phone already exists');
  }

  let referredBy = null;
  if (referralCode) {
    const referrer = await User.findOne({ referralCode });
    if (referrer) referredBy = referrer._id;
  }

  const user = await User.create({
    name,
    email,
    phone,
    password,
    referredBy,
    referralCode: crypto.randomBytes(4).toString('hex').toUpperCase(),
  });

  const accessToken = await issueTokens(user, res);

  sendEmail({
    to: user.email,
    subject: 'Welcome to Luxe Spa & Wellness',
    html: emailTemplates.welcome(user.name),
  });

  res
    .status(201)
    .json(new ApiResponse(201, { user: user.toSafeObject(), accessToken }, 'Registration successful'));
});

// @route POST /api/v1/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }
  if (!user.isActive) {
    throw new ApiError(403, 'Your account has been deactivated. Contact support.');
  }

  const accessToken = await issueTokens(user, res);

  res.status(200).json(new ApiResponse(200, { user: user.toSafeObject(), accessToken }, 'Login successful'));
});

// @route POST /api/v1/auth/refresh
const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) throw new ApiError(401, 'Refresh token missing');

  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch {
    throw new ApiError(401, 'Refresh token invalid or expired');
  }

  const user = await User.findById(decoded.id);
  if (!user || !user.refreshTokens.some((rt) => rt.token === token)) {
    throw new ApiError(401, 'Refresh token not recognized, please login again');
  }

  // rotate refresh token
  user.refreshTokens = user.refreshTokens.filter((rt) => rt.token !== token);
  const accessToken = await issueTokens(user, res);

  res.status(200).json(new ApiResponse(200, { accessToken }, 'Token refreshed'));
});

// @route POST /api/v1/auth/logout
const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (token) {
    const decoded = (() => {
      try {
        return verifyRefreshToken(token);
      } catch {
        return null;
      }
    })();
    if (decoded) {
      await User.findByIdAndUpdate(decoded.id, {
        $pull: { refreshTokens: { token } },
      });
    }
  }
  res.clearCookie('refreshToken', REFRESH_COOKIE_OPTIONS);
  res.status(200).json(new ApiResponse(200, null, 'Logged out successfully'));
});

// @route GET /api/v1/auth/me
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json(new ApiResponse(200, { user: req.user.toSafeObject() }));
});

// @route POST /api/v1/auth/forgot-password
const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    // Don't reveal user existence
    return res
      .status(200)
      .json(new ApiResponse(200, null, 'If an account exists, a reset link has been sent'));
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.passwordResetExpires = Date.now() + 15 * 60 * 1000;
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  await sendEmail({
    to: user.email,
    subject: 'Password Reset Request',
    html: emailTemplates.passwordReset(resetUrl),
  });

  res.status(200).json(new ApiResponse(200, null, 'If an account exists, a reset link has been sent'));
});

// @route POST /api/v1/auth/reset-password/:token
const resetPassword = asyncHandler(async (req, res) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) throw new ApiError(400, 'Reset token is invalid or has expired');

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.refreshTokens = []; // invalidate all sessions
  await user.save();

  res.status(200).json(new ApiResponse(200, null, 'Password reset successful, please log in'));
});

module.exports = {
  register,
  login,
  refresh,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
};
