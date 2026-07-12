const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: true },
    role: { type: String, enum: ["Admin", "ESGManager", "Employee"], default: "Employee" },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
    designation: { type: String },
    gender: { type: String, enum: ["Male", "Female", "Other", "PreferNotToSay"] },
    xp: { type: Number, default: 0 },
    points: { type: Number, default: 0 },
    badges: [{ type: mongoose.Schema.Types.ObjectId, ref: "Badge" }],
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = function (entered) {
  return bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model("User", userSchema);
