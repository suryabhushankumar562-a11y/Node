const Notification = require('../models/Notification');

const createNotification = async ({ user, title, message, type = 'system', link = '' }) => {
  return Notification.create({ user, title, message, type, link });
};

module.exports = { createNotification };
