const asyncHandler = require('express-async-handler');
const { verifyAccessToken } = require('../utils/generateTokens');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new ApiError(401, 'Not authorized, no access token provided');
  }

  try {
    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.id);

    if (!user) {
      throw new ApiError(401, 'User belonging to this token no longer exists');
    }
    if (!user.isActive) {
      throw new ApiError(403, 'Your account has been deactivated. Contact support.');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Access token expired');
    }
    if (error instanceof ApiError) throw error;
    throw new ApiError(401, 'Not authorized, token invalid');
  }
});

// Role Based Authorization
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new ApiError(403, `Role '${req.user?.role}' is not permitted to access this resource`);
    }
    next();
  };
};

module.exports = { protect, authorize };
