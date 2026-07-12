const Reward = require("../models/Reward");
const RewardRedemption = require("../models/RewardRedemption");
const User = require("../models/User");

async function redeemReward(req, res, next) {
  try {
    const reward = await Reward.findById(req.params.rewardId);
    if (!reward || reward.status !== "Active") {
      return res.status(404).json({ success: false, message: "Reward not available" });
    }
    if (reward.stock <= 0) {
      return res.status(400).json({ success: false, message: "Reward out of stock" });
    }

    const user = await User.findById(req.user._id);
    if (user.points < reward.pointsRequired) {
      return res.status(400).json({ success: false, message: "Insufficient points balance" });
    }

    user.points -= reward.pointsRequired;
    reward.stock -= 1;
    await user.save();
    await reward.save();

    const redemption = await RewardRedemption.create({
      employee: user._id,
      reward: reward._id,
      pointsSpent: reward.pointsRequired,
    });

    res.status(201).json({ success: true, data: redemption, remainingPoints: user.points });
  } catch (err) {
    next(err);
  }
}

async function myRedemptions(req, res, next) {
  try {
    const redemptions = await RewardRedemption.find({ employee: req.user._id }).populate("reward");
    res.json({ success: true, data: redemptions });
  } catch (err) {
    next(err);
  }
}

module.exports = { redeemReward, myRedemptions };
