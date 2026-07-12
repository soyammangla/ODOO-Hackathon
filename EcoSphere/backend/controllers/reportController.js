const CarbonTransaction = require("../models/CarbonTransaction");
const EmployeeParticipation = require("../models/EmployeeParticipation");
const ComplianceIssue = require("../models/ComplianceIssue");
const DepartmentScore = require("../models/DepartmentScore");
const { exportReport } = require("../services/reportService");
const { currentPeriod } = require("../services/scoreService");

function buildDateFilter(field, req) {
  const filter = {};
  if (req.query.from || req.query.to) {
    filter[field] = {};
    if (req.query.from) filter[field].$gte = new Date(req.query.from);
    if (req.query.to) filter[field].$lte = new Date(req.query.to);
  }
  return filter;
}

async function environmentalReport(req, res, next) {
  try {
    const filter = { ...buildDateFilter("transactionDate", req) };
    if (req.query.department) filter.department = req.query.department;

    const transactions = await CarbonTransaction.find(filter).populate("department").populate("emissionFactor");
    const rows = transactions.map((t) => ({
      department: t.department?.name || "",
      sourceType: t.sourceType,
      quantity: t.quantity,
      unit: t.unit,
      calculatedEmission: t.calculatedEmission,
      transactionDate: t.transactionDate.toISOString().split("T")[0],
    }));

    const columns = [
      { header: "Department", key: "department" },
      { header: "Source Type", key: "sourceType" },
      { header: "Quantity", key: "quantity" },
      { header: "Unit", key: "unit" },
      { header: "Emission (kgCO2e)", key: "calculatedEmission" },
      { header: "Date", key: "transactionDate" },
    ];

    const format = req.query.format || "json";
    if (format === "json") return res.json({ success: true, count: rows.length, data: rows });
    return exportReport(res, format, { title: "Environmental_Report", columns, rows });
  } catch (err) {
    next(err);
  }
}

async function socialReport(req, res, next) {
  try {
    const filter = { ...buildDateFilter("completionDate", req) };
    if (req.query.employee) filter.employee = req.query.employee;

    const participations = await EmployeeParticipation.find(filter)
      .populate("employee", "name department")
      .populate("activity", "title department");

    const rows = participations.map((p) => ({
      employee: p.employee?.name || "",
      activity: p.activity?.title || "",
      approvalStatus: p.approvalStatus,
      pointsEarned: p.pointsEarned,
      completionDate: p.completionDate ? p.completionDate.toISOString().split("T")[0] : "",
    }));

    const columns = [
      { header: "Employee", key: "employee" },
      { header: "CSR Activity", key: "activity" },
      { header: "Approval Status", key: "approvalStatus" },
      { header: "Points Earned", key: "pointsEarned" },
      { header: "Completion Date", key: "completionDate" },
    ];

    const format = req.query.format || "json";
    if (format === "json") return res.json({ success: true, count: rows.length, data: rows });
    return exportReport(res, format, { title: "Social_Report", columns, rows });
  } catch (err) {
    next(err);
  }
}

async function governanceReport(req, res, next) {
  try {
    const filter = { ...buildDateFilter("dueDate", req) };
    if (req.query.status) filter.status = req.query.status;

    const issues = await ComplianceIssue.find(filter).populate("audit", "title").populate("owner", "name");
    const rows = issues.map((i) => ({
      audit: i.audit?.title || "",
      severity: i.severity,
      description: i.description,
      owner: i.owner?.name || "",
      dueDate: i.dueDate.toISOString().split("T")[0],
      status: i.status,
    }));

    const columns = [
      { header: "Audit", key: "audit" },
      { header: "Severity", key: "severity" },
      { header: "Description", key: "description" },
      { header: "Owner", key: "owner" },
      { header: "Due Date", key: "dueDate" },
      { header: "Status", key: "status" },
    ];

    const format = req.query.format || "json";
    if (format === "json") return res.json({ success: true, count: rows.length, data: rows });
    return exportReport(res, format, { title: "Governance_Report", columns, rows });
  } catch (err) {
    next(err);
  }
}

async function esgSummaryReport(req, res, next) {
  try {
    const scores = await DepartmentScore.find({ period: req.query.period || currentPeriod() }).populate(
      "department",
      "name code"
    );
    const rows = scores.map((s) => ({
      department: s.department?.name || "",
      environmentalScore: s.environmentalScore,
      socialScore: s.socialScore,
      governanceScore: s.governanceScore,
      totalScore: s.totalScore,
      period: s.period,
    }));

    const columns = [
      { header: "Department", key: "department" },
      { header: "Environmental", key: "environmentalScore" },
      { header: "Social", key: "socialScore" },
      { header: "Governance", key: "governanceScore" },
      { header: "Total Score", key: "totalScore" },
      { header: "Period", key: "period" },
    ];

    const format = req.query.format || "json";
    if (format === "json") return res.json({ success: true, count: rows.length, data: rows });
    return exportReport(res, format, { title: "ESG_Summary_Report", columns, rows });
  } catch (err) {
    next(err);
  }
}

/**
 * Custom Report Builder: combines filters across Department, Date Range,
 * Module, Employee, Challenge, ESG Category and exports the matching module's data.
 */
async function customReport(req, res, next) {
  try {
    const { module } = req.query;
    const dispatch = {
      environmental: environmentalReport,
      social: socialReport,
      governance: governanceReport,
      summary: esgSummaryReport,
    };
    const handler = dispatch[module];
    if (!handler) {
      return res.status(400).json({
        success: false,
        message: "module must be one of: environmental, social, governance, summary",
      });
    }
    return handler(req, res, next);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  environmentalReport,
  socialReport,
  governanceReport,
  esgSummaryReport,
  customReport,
};
