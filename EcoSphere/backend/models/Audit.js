const mongoose = require("mongoose");

const auditSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
    auditor: { type: String },
    scope: { type: String },
    scheduledDate: { type: Date, required: true },
    completedDate: { type: Date },
    status: { type: String, enum: ["Scheduled", "InProgress", "Completed"], default: "Scheduled" },
    findingsSummary: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Audit", auditSchema);
