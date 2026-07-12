const mongoose = require("mongoose");

const challengeParticipationSchema = new mongoose.Schema(
  {
    challenge: { type: mongoose.Schema.Types.ObjectId, ref: "Challenge", required: true },
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    proof: { type: String },
    approval: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
    xpAwarded: { type: Number, default: 0 },
  },
  { timestamps: true }
);

challengeParticipationSchema.index({ challenge: 1, employee: 1 }, { unique: true });

module.exports = mongoose.model("ChallengeParticipation", challengeParticipationSchema);
