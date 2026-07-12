const mongoose = require("mongoose");

const esgPolicySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    category: { type: String, enum: ["Environmental", "Social", "Governance"], required: true },
    description: { type: String },
    documentUrl: { type: String },
    version: { type: String, default: "1.0" },
    effectiveDate: { type: Date, default: Date.now },
    mandatory: { type: Boolean, default: true },
    status: { type: String, enum: ["Draft", "Active", "Archived"], default: "Draft" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ESGPolicy", esgPolicySchema);
