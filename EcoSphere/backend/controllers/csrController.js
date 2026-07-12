const CSRActivity = require("../models/CSRActivity");
const EmployeeParticipation = require("../models/EmployeeParticipation");
const User = require("../models/User");
const OrgConfig = require("../models/OrgConfig");
const { evaluateBadgesForUser } = require("../services/badgeService");
const { notify } = require("../services/notificationService");

async function listActivities(req, res, next) {
  try {
    const activities = await CSRActivity.find(req.query.department ? { department: req.query.department } : {})
      .populate("category")
      .populate("department")
      .sort({ scheduledDate: -1 });
    res.json({ success: true, count: activities.length, data: activities });
  } catch (err) {
    next(err);
  }
}

async function createActivity(req, res, next) {
  try {
    const activity = await CSRActivity.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, data: activity });
  } catch (err) {
    next(err);
  }
}

async function updateActivity(req, res, next) {
  try {
    const activity = await CSRActivity.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!activity) return res.status(404).json({ success: false, message: "Activity not found" });
    res.json({ success: true, data: activity });
  } catch (err) {
    next(err);
  }
}

async function joinActivity(req, res, next) {
  try {
    const participation = await EmployeeParticipation.create({
      employee: req.user._id,
      activity: req.params.activityId,
    });
    res.status(201).json({ success: true, data: participation });
  } catch (err) {
    next(err);
  }
}

async function submitProof(req, res, next) {
  try {
    const participation = await EmployeeParticipation.findById(req.params.id);
    if (!participation) return res.status(404).json({ success: false, message: "Participation not found" });
    participation.proof = req.body.proof;
    participation.completionDate = new Date();
    await participation.save();
    res.json({ success: true, data: participation });
  } catch (err) {
    next(err);
  }
}

async function reviewParticipation(req, res, next) {
  try {
    const { decision } = req.body; // "Approved" | "Rejected"
    const participation = await EmployeeParticipation.findById(req.params.id).populate("activity");
    if (!participation) return res.status(404).json({ success: false, message: "Participation not found" });

    const config = await OrgConfig.findOne({ key: "global" });
    const evidenceRequired = participation.activity.evidenceRequired ?? config?.evidenceRequirementDefault;

    if (decision === "Approved" && evidenceRequired && !participation.proof) {
      return res.status(400).json({
        success: false,
        message: "Cannot approve: evidence is required and no proof file is attached",
      });
    }

    participation.approvalStatus = decision;
    participation.approvedBy = req.user._id;
    if (decision === "Approved") {
      participation.pointsEarned = participation.activity.pointsPerParticipation;
      await User.findByIdAndUpdate(participation.employee, {
        $inc: { points: participation.pointsEarned },
      });
    }
    await participation.save();

    await notify(
      participation.employee,
      "CSRApproval",
      `CSR participation ${decision.toLowerCase()}`,
      `Your participation in "${participation.activity.title}" was ${decision.toLowerCase()}.`,
      participation._id
    );

    if (decision === "Approved") await evaluateBadgesForUser(participation.employee);

    res.json({ success: true, data: participation });
  } catch (err) {
    next(err);
  }
}

async function myParticipations(req, res, next) {
  try {
    const participations = await EmployeeParticipation.find({ employee: req.user._id }).populate("activity");
    res.json({ success: true, data: participations });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listActivities,
  createActivity,
  updateActivity,
  joinActivity,
  submitProof,
  reviewParticipation,
  myParticipations,
};
