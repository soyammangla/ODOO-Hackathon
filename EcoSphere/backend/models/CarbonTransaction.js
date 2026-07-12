const mongoose = require("mongoose");

const carbonTransactionSchema = new mongoose.Schema(
  {
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
    sourceType: { type: String, enum: ["Purchase", "Manufacturing", "Expense", "Fleet"], required: true },
    sourceRefId: { type: String },
    emissionFactor: { type: mongoose.Schema.Types.ObjectId, ref: "EmissionFactor", required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true },
    calculatedEmission: { type: Number, required: true },
    emissionUnit: { type: String, default: "kgCO2e" },
    calculationMode: { type: String, enum: ["Auto", "Manual"], default: "Manual" },
    transactionDate: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CarbonTransaction", carbonTransactionSchema);
