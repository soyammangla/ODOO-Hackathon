const Badge = require("../models/Badge");
const User = require("../models/User");
const ChallengeParticipation = require("../models/ChallengeParticipation");
const OrgConfig = require("../models/OrgConfig");
const { notify } = require("./notificationService");

async function evaluateBadgesForUser(userId) {
  const config = await OrgConfig.findOne({ key: "global" });
  if (config && config.badgeAutoAward === false) return [];

  const user = await User.findById(userId);
  if (!user) return [];

  const completedChallenges = await ChallengeParticipation.countDocuments({
    employee: userId,
    approval: "Approved",
  });

  const badges = await Badge.find({ status: "Active" });
  const newlyAwarded = [];

  for (const badge of badges) {
    if (user.badges.some((b) => b.toString() === badge._id.toString())) continue;

    let metricValue = 0;
    if (badge.unlockRule.metric === "XP") metricValue = user.xp;
    if (badge.unlockRule.metric === "CompletedChallenges") metricValue = completedChallenges;
    if (badge.unlockRule.metric === "CSRParticipations") {
      const EmployeeParticipation = require("../models/EmployeeParticipation");
      metricValue = await EmployeeParticipation.countDocuments({
        employee: userId,
        approvalStatus: "Approved",
      });
    }

    if (metricValue >= badge.unlockRule.threshold) {
      user.badges.push(badge._id);
      newlyAwarded.push(badge);
      await notify(
        userId,
        "BadgeUnlock",
        "New badge unlocked",
        `You unlocked the "${badge.name}" badge.`,
        badge._id
      );
    }
  }

  if (newlyAwarded.length) await user.save();
  return newlyAwarded;
}

module.exports = { evaluateBadgesForUser };
