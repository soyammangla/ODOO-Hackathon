const mongoose = require("mongoose");

const employeeParticipationSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    activity: { type: mongoose.Schema.Types.ObjectId, ref: "CSRActivity", required: true },
    proof: { type: String },
    approvalStatus: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
    pointsEarned: { type: Number, default: 0 },
    completionDate: { type: Date },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

employeeParticipationSchema.index({ employee: 1, activity: 1 }, { unique: true });

module.exports = mongoose.model("EmployeeParticipation", employeeParticipationSchema);
