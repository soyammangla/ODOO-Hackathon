const Department = require("../models/Department");
const DepartmentScore = require("../models/DepartmentScore");
const ComplianceIssue = require("../models/ComplianceIssue");
const CarbonTransaction = require("../models/CarbonTransaction");
const Challenge = require("../models/Challenge");
const User = require("../models/User");
const {
  recalculateAllDepartmentScores,
  computeOverallESGScore,
  currentPeriod,
} = require("../services/scoreService");

async function organizationDashboard(req, res, next) {
  try {
    await recalculateAllDepartmentScores();
    const overall = await computeOverallESGScore();
    const departmentScores = await DepartmentScore.find({ period: currentPeriod() }).populate(
      "department",
      "name code"
    );
    const openIssues = await ComplianceIssue.countDocuments({ status: { $in: ["Open", "InProgress", "Overdue"] } });
    const totalEmission = await CarbonTransaction.aggregate([
      { $group: { _id: null, total: { $sum: "$calculatedEmission" } } },
    ]);
    const activeChallenges = await Challenge.countDocuments({ status: "Active" });
    const topPerformers = await User.find({ status: "Active" }).sort({ xp: -1 }).limit(5).select("name xp points");

    res.json({
      success: true,
      data: {
        overallESGScore: overall.overallScore,
        period: overall.period,
        departmentScores,
        openComplianceIssues: openIssues,
        totalCarbonEmission: totalEmission[0]?.total || 0,
        activeChallenges,
        topPerformers,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function departmentRankings(req, res, next) {
  try {
    const scores = await DepartmentScore.find({ period: currentPeriod() })
      .populate("department", "name code")
      .sort({ totalScore: -1 });
    res.json({ success: true, data: scores });
  } catch (err) {
    next(err);
  }
}

module.exports = { organizationDashboard, departmentRankings };
