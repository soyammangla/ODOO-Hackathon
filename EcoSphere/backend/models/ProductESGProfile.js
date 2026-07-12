const mongoose = require("mongoose");

const productESGProfileSchema = new mongoose.Schema(
  {
    productName: { type: String, required: true },
    productCode: { type: String, required: true, unique: true },
    category: { type: String },
    carbonFootprint: { type: Number, default: 0 },
    recyclable: { type: Boolean, default: false },
    sustainabilityCertifications: [{ type: String }],
    notes: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ProductESGProfile", productESGProfileSchema);
