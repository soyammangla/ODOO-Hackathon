const mongoose = require("mongoose");

const policyAcknowledgementSchema = new mongoose.Schema(
  {
    policy: { type: mongoose.Schema.Types.ObjectId, ref: "ESGPolicy", required: true },
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    acknowledgedAt: { type: Date },
    status: { type: String, enum: ["Pending", "Acknowledged"], default: "Pending" },
  },
  { timestamps: true }
);

policyAcknowledgementSchema.index({ policy: 1, employee: 1 }, { unique: true });

module.exports = mongoose.model("PolicyAcknowledgement", policyAcknowledgementSchema);
