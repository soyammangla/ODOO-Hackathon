const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    head: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    parentDepartment: { type: mongoose.Schema.Types.ObjectId, ref: "Department", default: null },
    employeeCount: { type: Number, default: 0 },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Department", departmentSchema);
