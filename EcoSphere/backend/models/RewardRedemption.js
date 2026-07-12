const mongoose = require("mongoose");

const rewardRedemptionSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reward: { type: mongoose.Schema.Types.ObjectId, ref: "Reward", required: true },
    pointsSpent: { type: Number, required: true },
    status: { type: String, enum: ["Redeemed", "Cancelled"], default: "Redeemed" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("RewardRedemption", rewardRedemptionSchema);
