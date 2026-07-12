const Challenge = require("../models/Challenge");
const ChallengeParticipation = require("../models/ChallengeParticipation");
const User = require("../models/User");
const { evaluateBadgesForUser } = require("../services/badgeService");
const { notify } = require("../services/notificationService");

const VALID_TRANSITIONS = {
  Draft: ["Active", "Archived"],
  Active: ["Under Review", "Archived"],
  "Under Review": ["Completed", "Active", "Archived"],
  Completed: ["Archived"],
  Archived: [],
};

async function listChallenges(req, res, next) {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    const challenges = await Challenge.find(filter).populate("category").sort({ deadline: 1 });
    res.json({ success: true, count: challenges.length, data: challenges });
  } catch (err) {
    next(err);
  }
}

async function createChallenge(req, res, next) {
  try {
    const challenge = await Challenge.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, data: challenge });
  } catch (err) {
    next(err);
  }
}

async function changeStatus(req, res, next) {
  try {
    const { status } = req.body;
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) return res.status(404).json({ success: false, message: "Challenge not found" });

    const allowed = VALID_TRANSITIONS[challenge.status] || [];
    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot move challenge from "${challenge.status}" to "${status}". Allowed: ${allowed.join(", ") || "none"}`,
      });
    }
    challenge.status = status;
    await challenge.save();
    res.json({ success: true, data: challenge });
  } catch (err) {
    next(err);
  }
}

async function joinChallenge(req, res, next) {
  try {
    const participation = await ChallengeParticipation.create({
      challenge: req.params.challengeId,
      employee: req.user._id,
    });
    res.status(201).json({ success: true, data: participation });
  } catch (err) {
    next(err);
  }
}

async function updateProgress(req, res, next) {
  try {
    const { progress, proof } = req.body;
    const participation = await ChallengeParticipation.findById(req.params.id);
    if (!participation) return res.status(404).json({ success: false, message: "Participation not found" });
    if (progress !== undefined) participation.progress = progress;
    if (proof) participation.proof = proof;
    await participation.save();
    res.json({ success: true, data: participation });
  } catch (err) {
    next(err);
  }
}

async function reviewParticipation(req, res, next) {
  try {
    const { decision } = req.body;
    const participation = await ChallengeParticipation.findById(req.params.id).populate("challenge");
    if (!participation) return res.status(404).json({ success: false, message: "Participation not found" });

    if (decision === "Approved" && participation.challenge.evidenceRequired && !participation.proof) {
      return res.status(400).json({
        success: false,
        message: "Cannot approve: evidence is required and no proof file is attached",
      });
    }

    participation.approval = decision;
    if (decision === "Approved") {
      participation.xpAwarded = participation.challenge.xp;
      await User.findByIdAndUpdate(participation.employee, { $inc: { xp: participation.xpAwarded } });
    }
    await participation.save();

    await notify(
      participation.employee,
      "ChallengeApproval",
      `Challenge ${decision.toLowerCase()}`,
      `Your progress on "${participation.challenge.title}" was ${decision.toLowerCase()}.`,
      participation._id
    );

    if (decision === "Approved") await evaluateBadgesForUser(participation.employee);

    res.json({ success: true, data: participation });
  } catch (err) {
    next(err);
  }
}

async function leaderboard(req, res, next) {
  try {
    const users = await User.find({ status: "Active" })
      .select("name xp points department badges")
      .populate("department", "name")
      .sort({ xp: -1 })
      .limit(parseInt(req.query.limit) || 20);
    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listChallenges,
  createChallenge,
  changeStatus,
  joinChallenge,
  updateProgress,
  reviewParticipation,
  leaderboard,
};
