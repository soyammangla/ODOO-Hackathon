const Notification = require("../models/Notification");
const OrgConfig = require("../models/OrgConfig");

async function notify(userId, type, title, message, relatedId = null) {
  const config = await OrgConfig.findOne({ key: "global" });
  if (config && config.notificationSettings && config.notificationSettings.inApp === false) {
    return null;
  }
  const notification = await Notification.create({ user: userId, type, title, message, relatedId });
  // Email dispatch would be wired here using config.notificationSettings.email
  return notification;
}

module.exports = { notify };
