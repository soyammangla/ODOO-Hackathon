const mongoose = require("mongoose");

const complianceIssueSchema = new mongoose.Schema(
  {
    audit: { type: mongoose.Schema.Types.ObjectId, ref: "Audit", required: true },
    severity: { type: String, enum: ["Low", "Medium", "High", "Critical"], required: true },
    description: { type: String, required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    dueDate: { type: Date, required: true },
    status: { type: String, enum: ["Open", "InProgress", "Resolved", "Overdue"], default: "Open" },
    resolvedDate: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ComplianceIssue", complianceIssueSchema);
