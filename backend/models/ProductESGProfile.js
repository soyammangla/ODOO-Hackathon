const mongoose = require("mongoose");

const productESGProfileSchema = new mongoose.Schema(
  {
    productName: { type: String, required: true, trim: true },
    productReference: { type: String, trim: true },
    carbonFootprint: { type: Number, min: 0 },
    environmentalScore: { type: Number, min: 0, max: 100 },
    recyclability: { type: String, trim: true },
    sustainabilityInformation: { type: String, trim: true },
    certifications: [{ type: String, trim: true }],
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ProductESGProfile", productESGProfileSchema);
