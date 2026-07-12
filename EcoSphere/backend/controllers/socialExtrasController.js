const User = require("../models/User");
const TrainingCompletion = require("../models/TrainingCompletion");

async function diversityMetrics(req, res, next) {
  try {
    const byGender = await User.aggregate([
      { $match: { status: "Active" } },
      { $group: { _id: "$gender", count: { $sum: 1 } } },
    ]);
    const byDepartment = await User.aggregate([
      { $match: { status: "Active" } },
      {
        $group: {
          _id: { department: "$department", gender: "$gender" },
          count: { $sum: 1 },
        },
      },
    ]);
    res.json({ success: true, data: { byGender, byDepartment } });
  } catch (err) {
    next(err);
  }
}

async function listTrainings(req, res, next) {
  try {
    const filter = req.query.employee ? { employee: req.query.employee } : {};
    const trainings = await TrainingCompletion.find(filter).populate("employee", "name department");
    res.json({ success: true, data: trainings });
  } catch (err) {
    next(err);
  }
}

async function assignTraining(req, res, next) {
  try {
    const training = await TrainingCompletion.create(req.body);
    res.status(201).json({ success: true, data: training });
  } catch (err) {
    next(err);
  }
}

async function updateTraining(req, res, next) {
  try {
    const training = await TrainingCompletion.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!training) return res.status(404).json({ success: false, message: "Training record not found" });
    res.json({ success: true, data: training });
  } catch (err) {
    next(err);
  }
}

module.exports = { diversityMetrics, listTrainings, assignTraining, updateTraining };
