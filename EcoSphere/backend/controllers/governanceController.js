const ESGPolicy = require("../models/ESGPolicy");
const PolicyAcknowledgement = require("../models/PolicyAcknowledgement");
const Audit = require("../models/Audit");
const ComplianceIssue = require("../models/ComplianceIssue");
const User = require("../models/User");
const { notify } = require("../services/notificationService");

async function publishPolicy(req, res, next) {
  try {
    const policy = await ESGPolicy.create(req.body);
    if (policy.status === "Active" && policy.mandatory) {
      const employees = await User.find({ status: "Active" });
      await Promise.all(
        employees.map((emp) =>
          PolicyAcknowledgement.create({ policy: policy._id, employee: emp._id }).catch(() => null)
        )
      );
      await Promise.all(
        employees.map((emp) =>
          notify(
            emp._id,
            "PolicyReminder",
            "New policy requires acknowledgement",
            `Please review and acknowledge: "${policy.title}".`,
            policy._id
          )
        )
      );
    }
    res.status(201).json({ success: true, data: policy });
  } catch (err) {
    next(err);
  }
}

async function acknowledgePolicy(req, res, next) {
  try {
    const ack = await PolicyAcknowledgement.findOneAndUpdate(
      { policy: req.params.policyId, employee: req.user._id },
      { status: "Acknowledged", acknowledgedAt: new Date() },
      { new: true, upsert: true }
    );
    res.json({ success: true, data: ack });
  } catch (err) {
    next(err);
  }
}

async function myAcknowledgements(req, res, next) {
  try {
    const acks = await PolicyAcknowledgement.find({ employee: req.user._id }).populate("policy");
    res.json({ success: true, data: acks });
  } catch (err) {
    next(err);
  }
}

async function createAudit(req, res, next) {
  try {
    const audit = await Audit.create(req.body);
    res.status(201).json({ success: true, data: audit });
  } catch (err) {
    next(err);
  }
}

async function listAudits(req, res, next) {
  try {
    const audits = await Audit.find().populate("department").sort({ scheduledDate: -1 });
    res.json({ success: true, count: audits.length, data: audits });
  } catch (err) {
    next(err);
  }
}

async function raiseComplianceIssue(req, res, next) {
  try {
    const issue = await ComplianceIssue.create(req.body);
    const admins = await User.find({ role: { $in: ["Admin", "ESGManager"] } });
    await Promise.all(
      admins.map((a) =>
        notify(
          a._id,
          "ComplianceIssue",
          "New compliance issue raised",
          `A new "${issue.severity}" severity issue was raised.`,
          issue._id
        )
      )
    );
    res.status(201).json({ success: true, data: issue });
  } catch (err) {
    next(err);
  }
}

async function listComplianceIssues(req, res, next) {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    const issues = await ComplianceIssue.find(filter).populate("audit").populate("owner", "name email").sort({ dueDate: 1 });
    res.json({ success: true, count: issues.length, data: issues });
  } catch (err) {
    next(err);
  }
}

async function updateComplianceIssue(req, res, next) {
  try {
    const issue = await ComplianceIssue.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!issue) return res.status(404).json({ success: false, message: "Issue not found" });
    res.json({ success: true, data: issue });
  } catch (err) {
    next(err);
  }
}

/** Scans Open/InProgress issues whose dueDate has passed and flags them Overdue. Runs via cron. */
async function flagOverdueIssues() {
  const now = new Date();
  const result = await ComplianceIssue.updateMany(
    { status: { $in: ["Open", "InProgress"] }, dueDate: { $lt: now } },
    { status: "Overdue" }
  );
  return result;
}

module.exports = {
  publishPolicy,
  acknowledgePolicy,
  myAcknowledgements,
  createAudit,
  listAudits,
  raiseComplianceIssue,
  listComplianceIssues,
  updateComplianceIssue,
  flagOverdueIssues,
};
