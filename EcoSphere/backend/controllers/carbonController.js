const CarbonTransaction = require("../models/CarbonTransaction");
const { calculateAndRecordEmission } = require("../services/emissionService");
const { recalculateDepartmentScore } = require("../services/scoreService");

async function createTransaction(req, res, next) {
  try {
    const { department, sourceType, sourceRefId, emissionFactorId, quantity, transactionDate } = req.body;
    const transaction = await calculateAndRecordEmission({
      department,
      sourceType,
      sourceRefId,
      emissionFactorId,
      quantity,
      transactionDate,
      createdBy: req.user._id,
      calculationMode: "Manual",
    });
    await recalculateDepartmentScore(department);
    res.status(201).json({ success: true, data: transaction });
  } catch (err) {
    next(err);
  }
}

async function listTransactions(req, res, next) {
  try {
    const filter = {};
    if (req.query.department) filter.department = req.query.department;
    if (req.query.sourceType) filter.sourceType = req.query.sourceType;
    if (req.query.from || req.query.to) {
      filter.transactionDate = {};
      if (req.query.from) filter.transactionDate.$gte = new Date(req.query.from);
      if (req.query.to) filter.transactionDate.$lte = new Date(req.query.to);
    }
    const transactions = await CarbonTransaction.find(filter)
      .populate("department")
      .populate("emissionFactor")
      .sort({ transactionDate: -1 });
    res.json({ success: true, count: transactions.length, data: transactions });
  } catch (err) {
    next(err);
  }
}

async function departmentCarbonSummary(req, res, next) {
  try {
    const summary = await CarbonTransaction.aggregate([
      { $group: { _id: "$department", totalEmission: { $sum: "$calculatedEmission" } } },
      { $lookup: { from: "departments", localField: "_id", foreignField: "_id", as: "department" } },
      { $unwind: "$department" },
      { $project: { department: "$department.name", totalEmission: 1 } },
      { $sort: { totalEmission: -1 } },
    ]);
    res.json({ success: true, data: summary });
  } catch (err) {
    next(err);
  }
}

module.exports = { createTransaction, listTransactions, departmentCarbonSummary };
