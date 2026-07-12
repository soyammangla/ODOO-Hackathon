const mongoose = require("mongoose");

const csrActivitySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    description: { type: String },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
    location: { type: String },
    scheduledDate: { type: Date, required: true },
    pointsPerParticipation: { type: Number, default: 10 },
    evidenceRequired: { type: Boolean, default: false },
    status: { type: String, enum: ["Planned", "Ongoing", "Completed", "Cancelled"], default: "Planned" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CSRActivity", csrActivitySchema);
