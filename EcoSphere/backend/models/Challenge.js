const mongoose = require("mongoose");

const challengeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    description: { type: String },
    xp: { type: Number, required: true, default: 50 },
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], default: "Easy" },
    evidenceRequired: { type: Boolean, default: false },
    deadline: { type: Date, required: true },
    status: {
      type: String,
      enum: ["Draft", "Active", "Under Review", "Completed", "Archived"],
      default: "Draft",
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Challenge", challengeSchema);
