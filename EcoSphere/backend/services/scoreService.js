const Department = require("../models/Department");
const CarbonTransaction = require("../models/CarbonTransaction");
const EnvironmentalGoal = require("../models/EnvironmentalGoal");
const EmployeeParticipation = require("../models/EmployeeParticipation");
const PolicyAcknowledgement = require("../models/PolicyAcknowledgement");
const ComplianceIssue = require("../models/ComplianceIssue");
const Audit = require("../models/Audit");
const DepartmentScore = require("../models/DepartmentScore");
const OrgConfig = require("../models/OrgConfig");

function currentPeriod() {
  const now = new Date();
  return `${now.getFullYear()}-Q${Math.floor(now.getMonth() / 3) + 1}`;
}

/**
 * Environmental score: based on goal achievement ratio (currentValue vs targetValue),
 * averaged across the department's active goals. 100 = all goals met or ahead.
 */
async function computeEnvironmentalScore(departmentId) {
  const goals = await EnvironmentalGoal.find({ department: departmentId });
  if (!goals.length) return 70; // neutral baseline when no goals configured
  let total = 0;
  goals.forEach((g) => {
    const ratio = g.targetValue === 0 ? 1 : Math.min(g.currentValue / g.targetValue, 1);
    total += ratio * 100;
  });
  return Math.round(total / goals.length);
}

/**
 * Social score: based on employee participation approval rate + policy acknowledgement rate.
 */
async function computeSocialScore(departmentId) {
  const participations = await EmployeeParticipation.find({}).populate({
    path: "activity",
    match: { department: departmentId },
  });
  const relevant = participations.filter((p) => p.activity);
  const approvalRate = relevant.length
    ? (relevant.filter((p) => p.approvalStatus === "Approved").length / relevant.length) * 100
    : 70;

  const acks = await PolicyAcknowledgement.find({}).populate("employee");
  const deptAcks = acks.filter((a) => a.employee && String(a.employee.department) === String(departmentId));
  const ackRate = deptAcks.length
    ? (deptAcks.filter((a) => a.status === "Acknowledged").length / deptAcks.length) * 100
    : 70;

  return Math.round((approvalRate + ackRate) / 2);
}

/**
 * Governance score: based on audit completion and open/overdue compliance issues.
 */
async function computeGovernanceScore(departmentId) {
  const audits = await Audit.find({ department: departmentId });
  const auditScore = audits.length
    ? (audits.filter((a) => a.status === "Completed").length / audits.length) * 100
    : 70;

  const auditIds = audits.map((a) => a._id);
  const issues = await ComplianceIssue.find({ audit: { $in: auditIds } });
  let issuePenalty = 0;
  issues.forEach((i) => {
    if (i.status === "Overdue") issuePenalty += 15;
    else if (i.status === "Open" || i.status === "InProgress") issuePenalty += 5;
  });

  return Math.max(Math.round(auditScore - issuePenalty), 0);
}

async function recalculateDepartmentScore(departmentId) {
  const config = (await OrgConfig.findOne({ key: "global" })) || {
    weights: { environmental: 40, social: 30, governance: 30 },
  };

  const environmentalScore = await computeEnvironmentalScore(departmentId);
  const socialScore = await computeSocialScore(departmentId);
  const governanceScore = await computeGovernanceScore(departmentId);

  const w = config.weights;
  const totalScore = Math.round(
    (environmentalScore * w.environmental + socialScore * w.social + governanceScore * w.governance) / 100
  );

  const period = currentPeriod();

  const score = await DepartmentScore.findOneAndUpdate(
    { department: departmentId, period },
    { environmentalScore, socialScore, governanceScore, totalScore },
    { upsert: true, new: true }
  );

  return score;
}

async function recalculateAllDepartmentScores() {
  const departments = await Department.find({ status: "Active" });
  const results = [];
  for (const dept of departments) {
    results.push(await recalculateDepartmentScore(dept._id));
  }
  return results;
}

async function computeOverallESGScore() {
  const period = currentPeriod();
  const scores = await DepartmentScore.find({ period });
  if (!scores.length) return { overallScore: 0, period, departmentCount: 0 };
  const total = scores.reduce((sum, s) => sum + s.totalScore, 0);
  return { overallScore: Math.round(total / scores.length), period, departmentCount: scores.length };
}

module.exports = {
  recalculateDepartmentScore,
  recalculateAllDepartmentScores,
  computeOverallESGScore,
  currentPeriod,
};
