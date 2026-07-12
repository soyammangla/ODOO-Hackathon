const CarbonTransaction = require("../models/CarbonTransaction");
const EmissionFactor = require("../models/EmissionFactor");
const EnvironmentalGoal = require("../models/EnvironmentalGoal");
const ProductESGProfile = require("../models/ProductESGProfile");
const { calculateCarbonEmission } = require("../services/emissionService");

async function getEmissionFactors(req, res, next) {
  try {
    const factors = await EmissionFactor.find({ active: { $ne: false } }).sort({ name: 1 });
    res.json({ success: true, data: factors });
  } catch (err) { next(err); }
}

async function createCarbonTransaction(req, res, next) {
  try {
    const { emissionFactor: emissionFactorId, activity, description, quantity, unit, transactionDate, metadata } = req.body;
    if (!emissionFactorId || !activity || quantity === undefined) {
      return res.status(400).json({ success: false, message: "Emission factor, activity, and quantity are required" });
    }
    const factor = await EmissionFactor.findOne({ _id: emissionFactorId, active: { $ne: false } });
    if (!factor) return res.status(404).json({ success: false, message: "Active emission factor not found" });
    if (unit && unit !== factor.unit) return res.status(400).json({ success: false, message: `Quantity unit must match the factor unit (${factor.unit})` });

    const carbonEmission = calculateCarbonEmission(quantity, factor.emissionFactor);
    const transaction = await CarbonTransaction.create({
      user: req.user._id,
      department: req.user.department,
      emissionFactor: factor._id,
      activity,
      description,
      quantity: Number(quantity),
      unit: factor.unit,
      carbonEmission,
      transactionDate: transactionDate || new Date(),
      metadata,
    });
    await transaction.populate("emissionFactor", "name unit emissionFactor factorUnit");
    res.status(201).json({ success: true, data: transaction });
  } catch (err) { next(err); }
}

async function getCarbonTransactions(req, res, next) {
  try {
    const transactions = await CarbonTransaction.find({ user: req.user._id })
      .populate("emissionFactor", "name unit emissionFactor factorUnit")
      .sort({ transactionDate: -1 });
    res.json({ success: true, data: transactions });
  } catch (err) { next(err); }
}

async function getCarbonTrend(req, res, next) {
  try {
    const groupBy = req.query.groupBy === "date" ? "%Y-%m-%d" : "%Y-%m";
    const trend = await CarbonTransaction.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: { $dateToString: { format: groupBy, date: "$transactionDate" } }, carbonEmission: { $sum: "$carbonEmission" }, transactionCount: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, period: "$_id", carbonEmission: { $round: ["$carbonEmission", 2] }, transactionCount: 1 } },
    ]);
    res.json({ success: true, data: trend });
  } catch (err) { next(err); }
}

async function createEnvironmentalGoal(req, res, next) {
  try {
    const goal = await EnvironmentalGoal.create({ ...req.body, user: req.user._id, department: req.body.department || req.user.department });
    res.status(201).json({ success: true, data: goal });
  } catch (err) { next(err); }
}

async function getEnvironmentalGoals(req, res, next) {
  try {
    const goals = await EnvironmentalGoal.find({ $or: [{ user: req.user._id }, { department: req.user.department }] }).sort({ deadline: 1, createdAt: -1 });
    res.json({ success: true, data: goals });
  } catch (err) { next(err); }
}

async function updateEnvironmentalGoal(req, res, next) {
  try {
    const allowed = ["title", "description", "targetEmissionReduction", "targetValue", "baselineValue", "currentValue", "startDate", "deadline", "status", "unit"];
    const update = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)));
    const goal = await EnvironmentalGoal.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, update, { new: true, runValidators: true });
    if (!goal) return res.status(404).json({ success: false, message: "Environmental goal not found" });
    res.json({ success: true, data: goal });
  } catch (err) { next(err); }
}

async function createProductESGProfile(req, res, next) { try { const profile = await ProductESGProfile.create(req.body); res.status(201).json({ success: true, data: profile }); } catch (err) { next(err); } }
async function getProductESGProfiles(req, res, next) { try { const profiles = await ProductESGProfile.find().sort({ productName: 1 }); res.json({ success: true, data: profiles }); } catch (err) { next(err); } }
async function getProductESGProfile(req, res, next) { try { const profile = await ProductESGProfile.findById(req.params.id); if (!profile) return res.status(404).json({ success: false, message: "Product ESG profile not found" }); res.json({ success: true, data: profile }); } catch (err) { next(err); } }
async function updateProductESGProfile(req, res, next) { try { const profile = await ProductESGProfile.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }); if (!profile) return res.status(404).json({ success: false, message: "Product ESG profile not found" }); res.json({ success: true, data: profile }); } catch (err) { next(err); } }
async function deleteProductESGProfile(req, res, next) { try { const profile = await ProductESGProfile.findByIdAndDelete(req.params.id); if (!profile) return res.status(404).json({ success: false, message: "Product ESG profile not found" }); res.json({ success: true, data: profile }); } catch (err) { next(err); } }

module.exports = { getEmissionFactors, createCarbonTransaction, getCarbonTransactions, getCarbonTrend, createEnvironmentalGoal, getEnvironmentalGoals, updateEnvironmentalGoal, createProductESGProfile, getProductESGProfiles, getProductESGProfile, updateProductESGProfile, deleteProductESGProfile };
