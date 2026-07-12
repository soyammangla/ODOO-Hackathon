const mongoose = require("mongoose");

const emissionFactorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    sourceType: {
      type: String,
      enum: ["Purchase", "Manufacturing", "Expense", "Fleet"],
      required: true,
    },
    scope: { type: String, enum: ["Scope1", "Scope2", "Scope3"], required: true },
    unit: { type: String, required: true },
    factorValue: { type: Number, required: true },
    factorUnit: { type: String, default: "kgCO2e" },
    effectiveFrom: { type: Date, default: Date.now },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("EmissionFactor", emissionFactorSchema);
