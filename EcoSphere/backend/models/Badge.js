const mongoose = require("mongoose");

const badgeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    icon: { type: String, default: "ti-award" },
    unlockRule: {
      metric: { type: String, enum: ["XP", "CompletedChallenges", "CSRParticipations"], required: true },
      threshold: { type: Number, required: true },
    },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Badge", badgeSchema);
