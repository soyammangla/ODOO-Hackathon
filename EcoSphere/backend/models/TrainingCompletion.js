const mongoose = require("mongoose");

const trainingCompletionSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    trainingName: { type: String, required: true },
    completedDate: { type: Date },
    status: { type: String, enum: ["Assigned", "InProgress", "Completed"], default: "Assigned" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TrainingCompletion", trainingCompletionSchema);
