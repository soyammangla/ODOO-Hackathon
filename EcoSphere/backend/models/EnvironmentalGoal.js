const mongoose = require("mongoose");

const environmentalGoalSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
    metric: { type: String, enum: ["CarbonEmission", "EnergyUsage", "WaterUsage", "WasteReduction"], required: true },
    targetValue: { type: Number, required: true },
    currentValue: { type: Number, default: 0 },
    unit: { type: String, default: "tCO2e" },
    startDate: { type: Date, required: true },
    targetDate: { type: Date, required: true },
    status: { type: String, enum: ["OnTrack", "AtRisk", "Achieved", "Missed"], default: "OnTrack" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("EnvironmentalGoal", environmentalGoalSchema);
