const mongoose = require("mongoose");

const orgConfigSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true, default: "global" },
    weights: {
      environmental: { type: Number, default: 40 },
      social: { type: Number, default: 30 },
      governance: { type: Number, default: 30 },
    },
    autoEmissionCalculation: { type: Boolean, default: true },
    evidenceRequirementDefault: { type: Boolean, default: false },
    badgeAutoAward: { type: Boolean, default: true },
    notificationSettings: {
      inApp: { type: Boolean, default: true },
      email: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("OrgConfig", orgConfigSchema);
