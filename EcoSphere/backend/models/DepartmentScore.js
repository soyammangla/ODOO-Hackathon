const mongoose = require("mongoose");

const departmentScoreSchema = new mongoose.Schema(
  {
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
    period: { type: String, required: true },
    environmentalScore: { type: Number, default: 0 },
    socialScore: { type: Number, default: 0 },
    governanceScore: { type: Number, default: 0 },
    totalScore: { type: Number, default: 0 },
  },
  { timestamps: true }
);

departmentScoreSchema.index({ department: 1, period: 1 }, { unique: true });

module.exports = mongoose.model("DepartmentScore", departmentScoreSchema);
